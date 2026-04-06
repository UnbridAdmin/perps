import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarMenuComponent } from './sidebar-menu/sidebar-menu.component';
import { WalletConnectService, WalletState } from './services/walletconnect.service';
import { CommonService } from './shared/commonService';
import { AuthorizationService } from './services/authorization.service';
import { CacheService } from './services/cache.service';
import { WalletConnectionCheckerService } from './services/WalletConnectionChecker.service';
import { LoginModel } from './shared/models/login.model';
import { Subscription, filter, distinctUntilChanged } from 'rxjs';
import { PriceTokenComponent } from './price-token/price-token.component';
import { TopBurnersComponent } from './top-burners/top-burners.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarMenuComponent, PriceTokenComponent, TopBurnersComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  host: {
    'class': 'app-container'
  }
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'perps';

  private subscriptions: Subscription = new Subscription();
  private logoutSubscription: Subscription = new Subscription();

  // FLAGS DE CONTROL SIMPLIFICADOS
  isProcessingLogin = false;
  isLoggingIn = false;
  isDisconnecting = false;
  isInitialized = false;
  signing: boolean = true;

  // TOAST PROPERTIES
  showToast = false;
  toastMessage = '';
  showSuccessToast = false;
  successToastMessage = '';
  showErrorToast = false;
  errorToastMessage = '';

  // DETECCIÓN INMEDIATA DE CUENTA
  private currentAccount: string | null = null;
  private accountChangeInProgress = false;
  private isFirstConnection = true;

  activeTab: 'for-you' | 'trending' = 'for-you';
  isHomePage = true;
  showNewsSidebar = true;
  currentpath: any;


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
        const mainPath = e.url.split('?')[0]; // Remove query params
        console.log('Current path:', this.currentpath);

        this.isHomePage = mainPath === '/' || mainPath === '/home';

        // Show sidebar on home, profile, and dynamic profiles (any route that isn't trade, login, or balance-activity)
        this.showNewsSidebar = (this.isHomePage ||
          mainPath.startsWith('/profile') ||
          (!mainPath.startsWith('/trade') && !mainPath.startsWith('/login'))) &&
          !mainPath.startsWith('/balance-activity') &&
          !mainPath.startsWith('/create-prediction') &&
          !mainPath.startsWith('/referral');
      });
  }

  async ngOnInit(): Promise<void> {
    try {
      console.log('🚀 Iniciando aplicación...');
      this.signing = true;

      // 1. INICIALIZAR SERVICIO WALLET
      await this.walletConnectService.initializeService();

      // 2. VERIFICAR SI HAY UNA SESIÓN PERSISTIDA ANTES DE CONFIGURAR DETECCIÓN
      const persistedAddress = this.commonService.getAccountAddress();
      if (persistedAddress) {
        console.log('📝 Sesión persistida encontrada:', persistedAddress);
        this.currentAccount = persistedAddress.toLowerCase();
        this.isFirstConnection = false;
      }

      // 3. CONFIGURAR DETECCIÓN INMEDIATA
      this.setupImmediateAccountChangeDetection();

      // 4. SUSCRIBIRSE A CAMBIOS DE ESTADO (SOLO COMO BACKUP)
      this.subscribeToWalletStateBackup();

      this.isInitialized = true;
      console.log('✅ Aplicación inicializada correctamente');
      const web3Modal = this.walletConnectService.getWeb3Modal();
      web3Modal.close();
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
   * CONFIGURACIÓN PRINCIPAL: Detección inmediata de cambios
   */
  private setupImmediateAccountChangeDetection(): void {
    const web3Modal = this.walletConnectService.getWeb3Modal();

    // Suscribirse a cambios de cuenta (FORMA CORRECTA Y ESTÁNDAR)
    if (web3Modal && typeof web3Modal.subscribeAccount === 'function') {
      console.log('🔍 Configurando detección de cuenta con subscribeAccount...');
      web3Modal.subscribeAccount((account: any) => {
        this.handleImmediateAccountChange(account);
      });
    }

    // Suscribirse a eventos del modal (para debugging)
    if (web3Modal?.subscribeEvents) {
      web3Modal.subscribeEvents((event: any) => {
        const eventName = event.type || event.event || (event.data?.event);
        console.log("📡 Evento de modal Reown:", eventName);
        this.handleWalletEvents(event);
      });
    }

    // ELIMINADO: getAccount('eip155') prematuro que causaba error de namespace
    console.log('✅ Detección de cuenta configurada (vía suscripción)');
  }

  private handleWalletEvents(event: any): void {
    console.log("📡 Evento de wallet:", event);

    if (event.data?.event === 'MODAL_LOADED') {
      this.signing = true;
    }

    if (event.data?.event === 'DISCONNECT_SUCCESS') {
      this.handleImmediateDisconnect();
    }
  }

  /**
   * MANEJADOR PRINCIPAL: Cambios inmediatos de cuenta
   */
  private handleImmediateAccountChange(info: any): void {
    if (this.accountChangeInProgress) {
      return;
    }

    // If we're in "disconnecting" state but receive a new valid address,
    // the user is reconnecting — reset the flag so login can proceed.
    const incomingAddress = info?.address?.toLowerCase() || null;
    if (this.isDisconnecting) {
      if (incomingAddress) {
        console.log('🔄 Reconnection detected while isDisconnecting was still true — resetting flag');
        this.isDisconnecting = false;
      } else {
        return; // Still disconnecting and no new address — ignore
      }
    }

    const newAddress = info?.address?.toLowerCase() || null;
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
        this.handleImmediateDisconnect();
        this.isFirstConnection = true;
      } else if (!prevAddress && newAddress) {
        // RECONEXION: Verificar si ya está autenticado para esta dirección específica
        const sessionAddress = localStorage.getItem('sessionAddress');
        const isSameAddress = sessionAddress?.toLowerCase() === newAddress;

        // ALWAYS request signature after logout - don't skip authentication
        if (this.authorizationService.isAuthenticated() && isSameAddress) {
          console.log('🟢 RECONEXIÓN - Usuario ya autenticado para esta dirección, saltando firma');
          this.commonService.saveAccountAddress(newAddress);
          this.commonService.updateUserAddress.next(true);
          this.isFirstConnection = false;
        } else {
          console.log('🔵 RECONEXIÓN - Dirección diferente o no autenticado, procesando...');
          this.processFirstConnection(newAddress);
          this.isFirstConnection = false;
        }
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

      // 1. CERRAR ACTIVAMENTE el modal de Reown (si está abierto)
      // No esperamos a que se cierre solo — lo cerramos nosotros
      const web3Modal = this.walletConnectService.getWeb3Modal();
      if (web3Modal && web3Modal.getIsModalOpen?.()) {
        console.log('🚪 Cerrando modal de Reown activamente...');
        await web3Modal.close();
      }

      // Pequeño margen para animación de cierre
      await new Promise(resolve => setTimeout(resolve, 600));

      // 2. Guardar cuenta
      this.commonService.saveAccountAddress(address);

      // 3. Verificar si es usuario existente o nuevo
      await this.checkUserAndProceed(address);

    } catch (error) {
      console.error('❌ Error en primera conexión:', error);
      this.signing = true;
    }
  }

  /**
   * BACKUP: Suscripción a cambios de estado
   */
  private subscribeToWalletStateBackup(): void {
    const walletStateSubscription = this.walletConnectService.walletState$
      .pipe(
        distinctUntilChanged((prev, curr) => {
          return prev.address?.toLowerCase() === curr.address?.toLowerCase() &&
            prev.isConnected === curr.isConnected;
        })
      )
      .subscribe(state => {
        // Solo actuar si la detección inmediata falló
        setTimeout(() => {
          if (this.accountChangeInProgress) return;

          const currentAddress = this.commonService.getAccountAddress()?.toLowerCase();
          const stateAddress = state.address?.toLowerCase();

          if (state.isConnected && stateAddress && stateAddress !== currentAddress) {
            console.log('🔄 Backup: Detectado cambio no capturado');

            if (!currentAddress && stateAddress) {
              // Primera conexión no detectada
              this.processFirstConnection(stateAddress);
            } else if (currentAddress && stateAddress) {
              // Cambio de cuenta no detectado
              this.processAccountChange(currentAddress, stateAddress);
            }
          }
        }, 1500);
      });

    this.logoutSubscription.add(walletStateSubscription);
  }

  /**
   * DESCONEXIÓN INMEDIATA
   */
  private handleImmediateDisconnect(): void {
    this.isFirstConnection = true;
    this.isDisconnecting = true;
    this.currentAccount = null; // Reset so reconnection with same wallet is detected as new

    // 1. Detener el monitoreo de la billetera primero
    this.walletConnectService.stopWalletMonitoring();

    // 2. Limpiar toda la sesión de autorización
    this.authorizationService.clearSession();

    // 3. Limpiar almacenamiento local
    this.clearAllStorage();

    // 4. Limpiar estado de la aplicación
    this.clearApplicationState();

    this.signing = true;

    // Redirigir a /home después del logout
    this.router.navigate(['/home']).then(() => {
      console.log('✅ Desconexión completada - Redirigido a /home');
      // CRITICAL: Reset isDisconnecting so future login attempts are not blocked
      this.isDisconnecting = false;
    });
  }

  private clearAllStorage(): void {
    sessionStorage.clear();
    const keysToRemove = ['expirationDate', 'signatureData', 'accountAddress', 'username', 'user_id', 'sessionAddress'];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    this.cacheService.clear();
  }

  private clearApplicationState(): void {
    this.commonService.saveAccountAddress('');
    this.commonService.updateUserAddress.next(true);
    this.walletConnectService.updateBalance.next(true);
    this.signing = true;
    this.isProcessingLogin = false;
  }


  /**
   * VERIFICACIÓN DE USUARIO Y FLUJO
   */
  private async checkUserAndProceed(address: string): Promise<void> {
    if (this.isLoggingIn) {
      return;
    }

    // Verificar si la dirección actual coincide con la sesión almacenada
    const sessionAddress = localStorage.getItem('sessionAddress');
    const isSameAddress = sessionAddress?.toLowerCase() === address.toLowerCase();

    // Solo saltar firma si estamos autenticados Y es la misma dirección
    if (this.authorizationService.isAuthenticated() && isSameAddress) {
      console.log('✅ Usuario ya autenticado para esta dirección, saltando firma.');
      this.isLoggingIn = false;
      this.commonService.saveAccountAddress(address);
      this.commonService.updateUserAddress.next(true);
      return;
    }

    this.isLoggingIn = true;
    this.signing = false;
    this.commonService.signatureProcessing?.next(true);

    try {
      console.log('🔍 Verificando usuario para dirección:', address);

      const existResp = await this.authorizationService
        .existUser({ address: address })
        .toPromise() as any;

      if (existResp.data[0] === 'true') {
        console.log('👤 Usuario existente detectado - Solicitando firma...');
        await this.handleExistingUser({ address });
      } else {
        const web3Modal = this.walletConnectService.getWeb3Modal();
        console.log('🆕 Nuevo usuario detectado');
        this.signing = true;
        this.commonService.saveAccountAddress(address);
        this.commonService.updateUserAddress.next(true);
        web3Modal.close();
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
      console.log('⚡ Procesando cambio de cuenta...');

      // 1. CERRAR ACTIVAMENTE el modal de Reown (si está abierto)
      const web3Modal = this.walletConnectService.getWeb3Modal();
      if (web3Modal && web3Modal.getIsModalOpen?.()) {
        console.log('🚪 Cerrando modal de Reown activamente...');
        await web3Modal.close();
      }
      await new Promise(resolve => setTimeout(resolve, 600));

      // 2. Limpiar sesión anterior
      await this.quickCleanPreviousSession();

      // 3. Guardar nueva cuenta
      this.commonService.saveAccountAddress(current);

      // 4. Solicitar firma
      await this.checkUserAndProceed(current);

    } catch (error) {
      console.error('❌ Error en cambio de cuenta:', error);
    }
  }

  /**
   * LIMPIEZA COMPLETA DE SESIÓN ANTERIOR
   */
  private async quickCleanPreviousSession(): Promise<void> {
    try {
      console.log('🧹 Limpiando sesión anterior para cambio de cuenta...');

      // 1. Detener monitoreo de wallet
      this.walletConnectService.stopWalletMonitoring();

      // 2. Limpiar sesión de autorización
      this.authorizationService.clearSession();

      // 3. Limpiar almacenamiento local específico
      const keysToRemove = ['expirationDate', 'signatureData', 'sessionAddress', 'username', 'user_id'];
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // 4. Limpiar cache
      this.cacheService.clear();

      // 5. Resetear estado de la aplicación
      this.commonService.saveAccountAddress('');
      this.commonService.updateUserAddress.next(true);
      this.walletConnectService.updateBalance.next(true);

      console.log('✅ Sesión anterior completamente limpiada');
    } catch (error) {
      console.log('⚠️ Error en limpieza de sesión anterior:', error);
    }
  }

  private async handleExistingUser(info: any): Promise<void> {
    if (this.isDisconnecting) return;

    try {
      // 1. Forzar el cierre de cualquier modal de Reown que haya quedado abierto
      const web3Modal = this.walletConnectService.getWeb3Modal();
      if (web3Modal && web3Modal.getIsModalOpen?.()) {
        console.log('🚪 Cerrando modal de Reown antes de pedir nuestra firma...');
        await web3Modal.close();
        // Pequeño delay para que el modal termine de cerrarse visualmente
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // 2. Pedir nuestra firma (la única)
      console.log('🔄 Solicitando nuestra firma de Unbrid...');
      const signatureData = await this.walletConnectService.signMessage(
        `Click to sign in and accept the Unbrid Terms of Service(https://unbrid.com/privacy-policy). Login with secure code:${this.commonService.generateUniqueUUID()}`,
      );
      web3Modal.close();
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
    this.authorizationService.setSession(resp.data[0].expires, info.address);

    // Use the component property instead of missing connectingWallet
    this.isProcessingLogin = false;

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
    this.isProcessingLogin = false;
  }

  logout() {
    this.isDisconnecting = true;
    this.handleImmediateDisconnect();
    // isDisconnecting is reset to false inside handleImmediateDisconnect after navigation completes
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.logoutSubscription?.unsubscribe();

    if (this.walletConnectService) {
      console.log('🧹 Limpiando estado de AppComponent');
    }
  }

  onTabChange(tab: 'for-you' | 'trending') {
    this.activeTab = tab;
    // Si estamos en home, actualizar el componente
    if (this.isHomePage) {
      this.router.navigate(['/home'], {
        queryParams: { tab },
        queryParamsHandling: 'merge'
      });
    }
  }

  showToastMessage(messages: string, time: number, status: number) {
    let notificationStatus: String;
    let notificationTitle: string;
    if (status == 100) {
      notificationStatus = "border-blue";
      notificationTitle = "Info";
      this.showToast = true;
      this.toastMessage = messages;
      setTimeout(() => {
        this.showToast = false;
      }, time);
    }
    if (status == 200) {
      notificationStatus = "border-green";
      notificationTitle = "Success";
      this.showSuccessToast = true;
      this.successToastMessage = messages;
      setTimeout(() => {
        this.showSuccessToast = false;
      }, time);
    }
    if (status == 400) {
      notificationStatus = "border-red";
      notificationTitle = "Error";
      this.showErrorToast = true;
      this.errorToastMessage = messages;
      setTimeout(() => {
        this.showErrorToast = false;
      }, time);
    }
  }
}

