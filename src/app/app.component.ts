import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarMenuComponent } from './sidebar-menu/sidebar-menu.component';
import { PostPredictionComponent } from './post-prediction/post-prediction.component';
import { NewsComponent } from './news/news.component';
import { WalletConnectService } from './services/walletconnect.service';
import { CommonService } from './shared/commonService';
import { AuthorizationService } from './services/authorization.service';
import { CacheService } from './services/cache.service';
import { WalletConnectionCheckerService } from './services/WalletConnectionChecker.service';
import { LoginModel } from './shared/models/login.model';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarMenuComponent, PostPredictionComponent, NewsComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  host: {
    'class': 'app-container'
  }
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'perps';
  activeTab: 'for-you' | 'trending' = 'for-you';
  isHomePage = true;
  private subscriptions: Subscription = new Subscription();
  signing: boolean = true;
  currentpath: any;
  private logoutSubscription: Subscription = new Subscription();
  private walletSubscription: Subscription = new Subscription();
  private isProcessing = false;
  private isDisconnecting: boolean = false;

  constructor(
    private router: Router,
    private walletConnectService: WalletConnectService,
    private commonService: CommonService,
    private authorizationService: AuthorizationService,
    private cacheService: CacheService,
    private connectionChecker: WalletConnectionCheckerService,
    private route: ActivatedRoute
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.currentpath = e.url;
        console.log('Current path:', this.currentpath);
        this.isHomePage = e.url === '/' || e.url === '/home';
      });
  }

  ngOnInit(): void {
    this.initializeWalletConnect();
    this.connectionChecker.startPeriodicCheck();
  }

  private initializeWalletConnect(): void {
    const web3Modal = this.walletConnectService.getWeb3Modal();

    if (!web3Modal) {
      console.warn("Web3Modal no está inicializado");
      return;
    }

    // Limpiar suscripción anterior si existe
    this.walletSubscription?.unsubscribe();

    // Suscribirse a eventos
    if (web3Modal.subscribeEvents) {
      web3Modal.subscribeEvents(this.handleWalletEvents.bind(this));
    }
    if (web3Modal.subscribeWalletInfo) {
      web3Modal.subscribeWalletInfo(this.handleProviderChange.bind(this));
    }
  }

  private handleWalletEvents(event: any): void {
    console.log("Wallet event:", event);

    if (event.data?.event === 'CONNECT_SUCCESS' &&
      !this.isDisconnecting &&
      (this.commonService.getAccountAddress() == '' || this.commonService.getAccountAddress() == null)) {
      const account = this.walletConnectService.getWeb3Modal().getAccount();
      this.signatureProcess(account);
    }

    if (event.data?.event === 'DISCONNECT_SUCCESS') {
      this.handleCompleteDisconnect();
    }
  }

  private handleCompleteDisconnect(): void {
    console.log("Iniciando proceso completo de desconexión");
    this.isDisconnecting = true;

    sessionStorage.clear();
    localStorage.clear();

    this.commonService.saveAccountAddress('');
    this.signing = true;
    this.isProcessing = false;

    this.walletConnectService.connectingWallet.next(false);
    this.commonService.signatureProcessing?.next(false);

    setTimeout(() => {
      this.isDisconnecting = false;
      console.log("Proceso de desconexión completado");
      this.logout();
    }, 100);
  }

  private async handleProviderChange(): Promise<void> {
    if (this.isDisconnecting) {
      console.log("Ignorando cambio de proveedor durante desconexión");
      return;
    }

    this.walletConnectService.updateBalance.next(true);
    this.walletConnectService.connectingWallet.next(false);

    const account = this.walletConnectService.getWeb3Modal().getAccount();
    console.log("Account from provider change:", account);

    if (account) {
      // Simplified: assume valid chain for now
      await this.handleValidChain(account);
    }
  }

  private async handleValidChain(info: any): Promise<void> {
    if (this.isDisconnecting) return;

    try {
      await this.authorizationService.ping().toPromise();
    } catch (error) {
      // Ping failed, proceed with signature process
    }
    await this.signatureProcess(info);
  }

  private async signatureProcess(info: any): Promise<void> {
    if (this.isDisconnecting) return;

    if (this.commonService.getAccountAddress() === info.address) {
      this.signing = true;
      return;
    }

    this.walletConnectService.connectingWallet.next(true);
    this.signing = false;

    try {
      const existResp = await this.authorizationService
        .existUser({ address: info.address })
        .toPromise() as any;

      if (existResp.data[0] === 'true') {
        await this.handleExistingUser(info);
      } else {
        this.commonService.saveAccountAddress(info.address);
        this.commonService.updateUserAddress.next(true);
      }
    } catch (error) {
      console.error('Error en signatureProcess:', error);
      this.signing = true;
    }
  }

  private async handleExistingUser(info: any): Promise<void> {
    if (this.isDisconnecting) return;

    try {
      const signatureData = await this.walletConnectService.signMessage(
        `Click to sign in and accept the Unbrid Terms of Service(https://unbrid.com/privacy-policy). Login with secure code:${this.commonService.generateUniqueUUID()}`,
      );

      try {
        await this.authorizationService.ping().toPromise();
        await this.authorizationService.logout().toPromise();
      } catch (error) {
      }

      await this.loginProcess(signatureData, info);
    } catch (error) {
      this.signing = true;
      console.log('Error in handleExistingUser:', error);
    }
  }

  private async loginProcess(signatureData: any, info: any): Promise<void> {
    if (this.isDisconnecting) return;

    try {
      const loginModel = new LoginModel({
        message: signatureData.message,
        signature: signatureData.signature,
        coin_id: 1,
        referral_code: '',
      });

      const resp = await this.authorizationService
        .login(loginModel)
        .toPromise() as any;
      this.handleSuccessfulLogin(resp, signatureData, info);
    } catch (error) {
      this.signing = true;
      this.handleFailedLogin(signatureData, info);
    }
  }

  private handleSuccessfulLogin(resp: any, signatureData: any, info: any): void {
    if (this.isDisconnecting) return;

    this.cacheService.set('signatureData', {
      message: signatureData.message,
      signature: signatureData.signature,
    });

    this.signing = true;
    this.commonService.saveAccountAddress(info.address);
    this.commonService.updateUserAddress.next(true);
    this.walletConnectService.updateBalance.next(true);
    localStorage.setItem('expirationDate', resp.data[0].expires);
    this.authorizationService.scheduleRefresh();
    this.walletConnectService.connectingWallet.next(false);
  }

  private handleFailedLogin(signatureData: any, info: any): void {
    if (this.isDisconnecting) return;

    this.cacheService.set('signatureData', {
      message: signatureData.message,
      signature: signatureData.signature,
    });

    this.signing = true;
    this.router.navigate(['/home']);
    this.commonService.saveAccountAddress(info.address);
    this.commonService.updateUserAddress.next(true);
    this.walletConnectService.updateBalance.next(true);
    this.walletConnectService.connectingWallet.next(false);
  }

  logout() {
    this.isDisconnecting = true;
    this.logoutSubscription = this.authorizationService.logout().subscribe({
      next: (pingResp: any) => {
        sessionStorage.clear();
        localStorage.clear();
        this.commonService.saveAccountAddress('');
        this.commonService.logoutBalance.next("NaN");
        this.router.navigate(['/']).then(() => {
          this.isDisconnecting = false;
        });
      },
      error: (error: any) => {
        sessionStorage.clear();
        localStorage.clear();
        this.commonService.saveAccountAddress('');
        this.commonService.logoutBalance.next("NaN");
        this.router.navigate(['/']).then(() => {
          this.isDisconnecting = false;
        });
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.connectionChecker.stopPeriodicCheck();
    this.logoutSubscription?.unsubscribe();
    this.walletSubscription?.unsubscribe();
  }

  onTabChange(tab: 'for-you' | 'trending') {
    this.activeTab = tab;
  }
}
