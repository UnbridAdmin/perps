import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarMenuComponent } from './sidebar-menu/sidebar-menu.component';
import { PostPredictionComponent } from './post-prediction/post-prediction.component';
import { NewsComponent } from './news/news.component';
import { WalletConnectService, WalletState } from './services/walletconnect.service';
import { CommonService } from './shared/commonService';
import { AuthorizationService } from './services/authorization.service';
import { CacheService } from './services/cache.service';
import { WalletConnectionCheckerService } from './services/WalletConnectionChecker.service';
import { LoginModel } from './shared/models/login.model';
import { Subscription, filter, distinctUntilChanged } from 'rxjs';

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
  showNewsSidebar = true;
  private subscriptions: Subscription = new Subscription();
  signing: boolean = true;
  currentpath: any;
  private logoutSubscription: Subscription = new Subscription();
  private walletSubscription: Subscription = new Subscription();
  private isProcessing = false;
  private isDisconnecting: boolean = false;
  private isLoggingIn = false;

  // Wallet persistence - Enhanced state management like Fierce
  private currentAccount: string | null = null;
  private accountChangeInProgress = false;
  private isFirstConnection = true;
  private lastProcessedAddress: string = '';
  private isProcessingLogin = false;
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
        this.showNewsSidebar = this.isHomePage || e.url === '/profile';
      });
  }

  async ngOnInit(): Promise<void> {
    try {
      console.log('🚀 Iniciando aplicación...');
      this.signing = true;

      // 1. INICIALIZAR SERVICIO WALLET
      await this.walletConnectService.initializeService();

      // 2. SUSCRIBIRSE A CAMBIOS DE ESTADO
      this.setupWalletSubscriptions();

      // 3. VERIFICAR CONEXIÓN PERSISTIDA
      await this.handlePersistedConnection();

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
   * SUSCRIPCIONES DE WALLET - Optimizado como en Fierce
   */
  private setupWalletSubscriptions(): void {
    this.walletSubscription = this.walletConnectService.walletState$
      .pipe(
        distinctUntilChanged((prev, curr) => {
          const prevAddr = prev.address?.toLowerCase() || '';
          const currAddr = curr.address?.toLowerCase() || '';

          return prevAddr === currAddr &&
                 prev.chainId === curr.chainId &&
                 prev.isConnected === curr.isConnected;
        })
      )
      .subscribe(state => {
        console.log('🔄 AppComponent - Estado de wallet:', state);
        this.handleWalletStateChange(state);
      });
  }

  /**
   * MANEJO DE CONEXIÓN PERSISTIDA - Optimizado como en Fierce
   */
  private async handlePersistedConnection(): Promise<void> {
    const currentState = this.walletConnectService.walletStateSubject.value;

    if (currentState.isConnected && currentState.address) {
      console.log('🔍 Conexión persistida detectada:', currentState.address);

      const currentAddress = this.commonService.getAccountAddress();
      const newAddress = currentState.address.toLowerCase();

      // Verificar si es la misma dirección
      if (currentAddress?.toLowerCase() === newAddress) {
        console.log('✅ Ya sincronizado con la conexión persistida');
        this.signing = true;
        this.lastProcessedAddress = newAddress;
        this.currentAccount = newAddress;
        return;
      }

      // Procesar inmediatamente sin delay
      if (!this.isProcessingLogin) {
        console.log('🔄 Procesando conexión persistida inmediatamente...');
        await this.handleWalletConnection(currentState);
      }
    } else {
      this.signing = true;
    }
  }

  /**
   * MANEJO DE CAMBIOS DE ESTADO DE WALLET - Optimizado como en Fierce
   */
  private async handleWalletStateChange(state: WalletState): Promise<void> {
    console.log("🟢 [1] handleWalletStateChange INICIO", {
      isConnected: state.isConnected,
      address: state.address,
      isDisconnecting: this.isDisconnecting,
      isProcessingLogin: this.isProcessingLogin,
      lastProcessed: this.lastProcessedAddress
    });

    if (this.isDisconnecting) {
      console.log("🟡 [1.1] Ignorando por desconexión en progreso");
      return;
    }

    const newAddress = state.address?.toLowerCase() || '';

    // Si hay un cambio a estado conectado
    if (state.isConnected && state.address && state.chainId) {

      // Evitar reprocesar la misma dirección
      if (newAddress === this.lastProcessedAddress && !this.isProcessingLogin) {
        console.log("⏭️ [1.1.5] Dirección ya procesada, omitiendo...");
        return;
      }

      if (!this.isProcessingLogin) {
        console.log("🔵 [1.2] Wallet conectada, procesando...");
        await this.handleWalletConnection(state);
      }
    }
    // Si se desconectó
    else if (!state.isConnected && this.commonService.getAccountAddress()) {
      console.log("🔴 [1.3] Wallet desconectada, limpiando...");
      this.lastProcessedAddress = '';
      this.currentAccount = null;
      this.handleCompleteDisconnect();
    }

    console.log("🟢 [1.4] handleWalletStateChange FIN");
  }

  /**
   * PROCESAMIENTO DE WALLET STATE CONEXIÓN - Optimizado
   */
  private async handleWalletConnection(state: WalletState): Promise<void> {
    if (!state.address) return;

    await this.processWalletConnection(state.address);
  }

  /**
   * PROCESAMIENTO DE CONEXIÓN DE WALLET - Optimizado como en Fierce
   */
  private async processWalletConnection(address: string): Promise<void> {
    if (this.isProcessingLogin) {
      console.log('⏳ Proceso ya en progreso');
      return;
    }

    this.isProcessingLogin = true;
    const normalizedAddress = address.toLowerCase();

    try {
      console.log('🔐 Procesando conexión para:', normalizedAddress);

      const currentAddress = this.commonService.getAccountAddress();
      const currentNormalized = currentAddress?.toLowerCase() || '';

      // OPTIMIZADO: Detección inmediata de cambio de cuenta
      const isAccountChange = currentAddress && currentNormalized !== normalizedAddress;

      if (isAccountChange) {
        console.log('🔄 CAMBIO DE CUENTA DETECTADO');
        this.commonService.accountChanging?.next(true);
        this.changeAccount();
      }

      // SIEMPRE verificar usuario al conectar (incluyendo conexiones persistidas)
      console.log('🔍 Verificando usuario para dirección:', normalizedAddress);
      await this.checkUserAndProceed(normalizedAddress);

      // Marcar como procesada
      this.lastProcessedAddress = normalizedAddress;
      this.currentAccount = normalizedAddress;

    } catch (error) {
      console.error('❌ Error en proceso de conexión:', error);
      this.signing = true;
      this.commonService.accountChanging?.next(false);
    } finally {
      this.isProcessingLogin = false;
    }
  }

  /**
   * MANEJO DE NUEVA CONEXIÓN DE USUARIO - Optimizado
   */
  private async handleNewUserConnection(address: string, isAccountChange: boolean = false): Promise<void> {
    const normalizedAddress = address.toLowerCase();

    try {
      // OPTIMIZADO: Guardar y actualizar en paralelo
      this.commonService.saveAccountAddress(address);
      this.walletConnectService.updateBalance.next(true);
      this.signing = true;

      console.log('✅ Nueva cuenta configurada:', normalizedAddress);

      // Notificar fin del cambio INMEDIATAMENTE
      if (isAccountChange) {
        setTimeout(() => {
          this.commonService.accountChanging?.next(false);
        }, 100);
      }

    } catch (error) {
      console.error('❌ Error en handleNewUserConnection:', error);
      this.commonService.accountChanging?.next(false);
    }
  }

  /**
   * FINALIZACIÓN DE CONEXIÓN - Optimizado
   */
  private finalizeConnection(address: string): void {
    this.commonService.saveAccountAddress(address);
    this.walletConnectService.updateBalance.next(true);
    this.signing = true;
    console.log('✅ Conexión finalizada exitosamente');
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
    this.walletConnectService.updateBalance.next(true);
    localStorage.setItem('expirationDate', resp.data[0].expires);
    this.authorizationService.scheduleRefresh();
    this.walletConnectService.connectingWallet.next(false);

    // Redirect to home after successful login
    this.router.navigate(['/home']).then(() => {
      // Trigger UI update after navigation is complete
      setTimeout(() => {
        this.commonService.updateUserAddress.next(true);
      }, 100);
    });
  }

  private handleFailedLogin(signatureData: any, info: any): void {
    if (this.isDisconnecting) return;

    this.cacheService.set('signatureData', {
      message: signatureData.message,
      signature: signatureData.signature,
    });

    this.signing = true;
    this.router.navigate(['/login']);
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

    // NUEVO: Asegurar estado limpio
    if (this.walletConnectService) {
      console.log('🧹 Limpiando estado de AppComponent');
    }
  }

  onTabChange(tab: 'for-you' | 'trending') {
    this.activeTab = tab;
  }
}
