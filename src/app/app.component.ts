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
  private isLoggingIn = false;

  // Wallet persistence
  private currentAccount: string | null = null;
  private accountChangeInProgress = false;
  private isFirstConnection = true;
  isInitialized = false;

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

  async ngOnInit(): Promise<void> {
    try {
      console.log('🚀 Iniciando aplicación...');
      this.signing = true;

      // 1. INICIALIZAR WALLET SERVICE
      this.initializeWalletConnect();

      // 2. CONFIGURAR DETECCIÓN INMEDIATA DE CAMBIOS DE CUENTA
      this.setupImmediateAccountChangeDetection();

      // 3. SUSCRIBIRSE A CAMBIOS DE ESTADO
      this.setupWalletSubscriptions();

      // 4. VERIFICAR CONEXIÓN PERSISTIDA
      await this.handlePersistedConnection();

      // 5. INICIAR CHECKER
      //this.connectionChecker.startPeriodicCheck();

      this.isInitialized = true;
      console.log('✅ Aplicación inicializada correctamente');

    } catch (error) {
      console.error('❌ Error en inicialización de app:', error);
      this.signing = true;
    } finally {
      setTimeout(() => {
        this.signing = true;
      }, 500);
    }
  }

  /**
   * SUSCRIPCIONES DE WALLET
   */
  private setupWalletSubscriptions(): void {
    // Adaptado para perps - vacío por ahora, ya que no hay walletState$
  }

  /**
   * MANEJO DE CONEXIÓN PERSISTIDA
   */
  private async handlePersistedConnection(): Promise<void> {
    const persistedAddress = this.commonService.getAccountAddress();
    if (persistedAddress) {
      console.log('🔍 Conexión persistida detectada:', persistedAddress);
      this.currentAccount = persistedAddress.toLowerCase();
      this.isFirstConnection = false;
      this.signing = true;
    } else {
      this.signing = true;
    }
  }

  /**
   * CONFIGURACIÓN PRINCIPAL: Detección inmediata de cambios
   */
  private setupImmediateAccountChangeDetection(): void {
    const web3Modal = this.walletConnectService.getWeb3Modal();

    // Suscribirse a cambios de proveedor (PRINCIPAL)
    if (web3Modal && typeof web3Modal.subscribeWalletInfo === 'function') {
      console.log('🔍 Configurando detección inmediata de cambios de cuenta...');
      web3Modal.subscribeWalletInfo(this.handleImmediateAccountChange.bind(this));
    }

    // Suscribirse a eventos del modal
    if (web3Modal?.subscribeEvents) {
      web3Modal.subscribeEvents(this.handleWalletEvents.bind(this));
    }

    // Obtener cuenta inicial del modal (si existe)
    const initialAccount = web3Modal?.getAccount();
    const modalAddress = initialAccount?.address?.toLowerCase() || null;

    // Solo establecer como cuenta actual si no hay una sesión persistida
    if (!this.currentAccount && modalAddress) {
      this.currentAccount = modalAddress;
      console.log('📍 Cuenta inicial detectada del modal:', this.currentAccount);
    }
  }

  /**
   * MANEJADOR PRINCIPAL: Cambios inmediatos de cuenta
   */
  private handleImmediateAccountChange(info: any): void {
    if (this.accountChangeInProgress || this.isDisconnecting) {
      return;
    }

    const web3Modal = this.walletConnectService.getWeb3Modal();
    const changedAccount = web3Modal?.getAccount();
    const newAddress = changedAccount?.address?.toLowerCase() || null;
    const prevAddress = this.currentAccount;

    // Solo procesar si hay un cambio real
    if (prevAddress !== newAddress) {
      console.log('🔄 Cambio detectado:', {
        prevAddress,
        newAddress,
        isFirstConnection: this.isFirstConnection
      });

      this.accountChangeInProgress = true;

      if (this.isFirstConnection && newAddress) {
        // PRIMERA CONEXIÓN
        console.log('🟢 PRIMERA CONEXIÓN - Procesando...');
        this.processFirstConnection(newAddress);
        this.isFirstConnection = false;
      } else if (prevAddress && newAddress) {
        // CAMBIO DE CUENTA
        console.log('⚡ CAMBIO DE CUENTA - Procesando...');
        this.processAccountChange(prevAddress, newAddress);
      } else if (prevAddress && !newAddress) {
        // DESCONEXIÓN
        console.log('🔴 DESCONEXIÓN - Procesando...');
        this.handleCompleteDisconnect();
        this.isFirstConnection = true; // Reset para próxima conexión
      } else if (!prevAddress && newAddress) {
        // RECONEXIÓN SIN SESIÓN PERSISTIDA
        console.log('🔵 RECONEXIÓN - Procesando...');
        this.processFirstConnection(newAddress);
        this.isFirstConnection = false;
      }

      this.currentAccount = newAddress;
      this.accountChangeInProgress = false;
    }
  }

  /**
   * PROCESAMIENTO PRIMERA CONEXIÓN
   */
  private async processFirstConnection(address: string): Promise<void> {
    try {
      console.log('🎯 Procesando primera conexión para:', address);

      // 1. Guardar cuenta inmediatamente
      this.commonService.saveAccountAddress(address);

      // 2. Verificar si es usuario existente o nuevo
      await this.checkUserAndProceed(address);

    } catch (error) {
      console.error('❌ Error en primera conexión:', error);
      this.signing = true;
    }
  }

  /**
   * VERIFICACIÓN DE USUARIO Y FLUJO
   */
  private async checkUserAndProceed(address: string): Promise<void> {
    if (this.isLoggingIn) {
      return;
    }

    this.isLoggingIn = true;
    this.signing = false;
    this.commonService.signatureProcessing?.next(true);

    try {
      console.log('🔍 Verificando usuario...');

      const existResp = await this.authorizationService
        .existUser({ address: address })
        .toPromise() as any;

      if (existResp.data[0] === 'true') {
        console.log('👤 Usuario existente detectado - Solicitando firma...');
        await this.handleExistingUser({ address });
      } else {
        console.log('🆕 Nuevo usuario detectado');
        this.signing = true;
        // For perps, we don't navigate, just save address
        this.commonService.saveAccountAddress(address);
        this.commonService.updateUserAddress.next(true);
      }
    } catch (error) {
      console.error('❌ Error en verificación de usuario:', error);
      this.signing = true;
    } finally {
      this.isLoggingIn = false;
      this.commonService.signatureProcessing?.next(false);
    }
  }

  /**
   * PROCESAMIENTO RÁPIDO: Cambio de cuenta
   */
  private async processAccountChange(previous: string, current: string): Promise<void> {
    try {
      // 1. Limpiar sesión anterior RÁPIDO
      await this.quickCleanPreviousSession();

      // 2. Guardar nueva cuenta
      this.commonService.saveAccountAddress(current);

      // 3. SOLICITAR FIRMA INMEDIATAMENTE
      await this.checkUserAndProceed(current);

    } catch (error) {
      console.error('❌ Error en cambio de cuenta:', error);
    }
  }

  /**
   * LIMPIEZA RÁPIDA DE SESIÓN ANTERIOR
   */
  private async quickCleanPreviousSession(): Promise<void> {
    try {
      // Limpiar storage local inmediatamente
      sessionStorage.clear();
      localStorage.removeItem('accountAddress');
      localStorage.removeItem('signatureData');
      localStorage.removeItem('expirationDate');

      // Logout en segundo plano (no esperar)
      this.authorizationService.logout().subscribe({
        next: () => console.log('✅ Sesión anterior limpiada'),
        error: () => console.log('⚠️ Sesión anterior ya limpiada')
      });
    } catch (error) {
      console.log('⚠️ Error en limpieza rápida:', error);
    }
  }

  /**
   * BACKUP: Suscripción a cambios de estado
   */
  private subscribeToWalletStateBackup(): void {
    // For now, we'll skip this as it requires walletState$ from service
    // In the panel project, they have a more complex wallet service with state
  }

  private initializeWalletConnect(): void {
    const web3Modal = this.walletConnectService.getWeb3Modal();

    if (!web3Modal) {
      console.warn("Web3Modal no está inicializado");
      return;
    }

    // Limpiar suscripción anterior si existe
    this.walletSubscription?.unsubscribe();
  }

  private handleWalletEvents(event: any): void {
    console.log("Wallet event:", event);

    if (event.data?.event === 'MODAL_LOADED') {
      this.signing = true;
    }

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
      const chainId = await this.walletConnectService.getChainId();
      if (this.commonService.validateChains(Number(chainId))) {
        await this.handleValidChain(account);
      } else {
        await this.handleInvalidChain();
      }
    }
  }

  private async handleInvalidChain(): Promise<void> {
    await this.walletConnectService.switchNetwork();
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
    if (this.isDisconnecting || this.isLoggingIn) return;

    if (this.commonService.getAccountAddress() === info.address) {
      this.signing = true;
      return;
    }

    this.walletConnectService.connectingWallet.next(true);
    this.signing = false;
    this.isLoggingIn = true;

    try {
      const existResp = await this.authorizationService
        .existUser({ address: info.address })
        .toPromise() as any;

      if (existResp.data[0] === 'true') {
        await this.handleExistingUser(info);
      } else {
        this.changeAccount();
        await this.handleNewUser(info);
      }
    } catch (error) {
      console.error('Error en signatureProcess:', error);
      this.signing = true;
    }
  }

  private async handleNewUser(info: any): Promise<void> {
    if (this.isDisconnecting) return;

    this.signing = true;

    if (this.currentpath.includes('/category')) {
      // Logic for categories if needed
    } else {
      // Default logic
    }

    // Save address if not disconnecting
    if (!this.isDisconnecting) {
      this.commonService.saveAccountAddress(info.address);
      this.commonService.updateUserAddress.next(true);
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
    this.isLoggingIn = false;
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

  changeAccount() {
    this.logoutSubscription = this.authorizationService.logout().subscribe({
      next: (pingResp: any) => {
        sessionStorage.clear();
      },
      error: (error: any) => {
      },
    });
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
    //this.connectionChecker.stopPeriodicCheck();
    this.logoutSubscription?.unsubscribe();
    this.walletSubscription?.unsubscribe();
  }

  onTabChange(tab: 'for-you' | 'trending') {
    this.activeTab = tab;
  }
}
