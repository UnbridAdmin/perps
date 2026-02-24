import { isPlatformBrowser } from '@angular/common';
import {
  Inject,
  Injectable,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  BrowserProvider,
  Contract,
  ethers,
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
} from 'ethers';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { createAppKit } from '@reown/appkit';
import { polygon, polygonAmoy } from '@reown/appkit/networks';
import { environment } from '../../environments/environment';
import { CommonService } from '../shared/commonService';

/**
 * @interface WalletState
 * Define una estructura estandarizada para el estado de la billetera.
 */
export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  chainId: number | null;
  provider: any | null;
}

/**
 * @const INITIAL_STATE
 * Define el estado inicial y por defecto de la billetera cuando no hay conexión.
 */
const INITIAL_STATE: WalletState = {
  isConnected: false,
  isConnecting: false,
  address: null,
  chainId: null,
  provider: null,
};

@Injectable({ providedIn: 'root' })
export class WalletConnectService implements OnDestroy {
  public appKit: any;
  private appKitSubscriptions: (() => void)[] = [];

  /**
   * @property walletState$
   * Es la ÚNICA FUENTE DE VERDAD sobre el estado de la billetera.
   */
  readonly walletStateSubject = new BehaviorSubject<WalletState>(INITIAL_STATE);
  readonly walletState$ = this.walletStateSubject.asObservable();

  updateBalance: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  connectingWallet: BehaviorSubject<any> = new BehaviorSubject<any>(false);

  private readonly projectId = environment.WALLETCONNEC.projectId;
  private readonly STORAGE_KEY = 'perps_wallet_connection_state';
  private initializationPromise: Promise<void> | null = null;
  private isServiceReady = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private commonService: CommonService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeService();
    }
  }

  public async initializeService(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  private async _performInitialization(): Promise<void> {
    try {
      console.log('🔄 Iniciando inicialización de WalletConnect...');

      // 1. Inicializar AppKit PRIMERO
      await this.initializeAppKit();

      // 2. Dar tiempo a AppKit para inicializar completamente
      await this.waitForAppKitReady();

      // 3. Verificar y actualizar el estado real de conexión
      await this.updateConnectionState();

      // 4. Si no hay conexión activa, restaurar estado persistido
      const currentState = this.walletStateSubject.value;
      if (!currentState.isConnected) {
        await this.restoreConnectionState();
      }

      this.isServiceReady = true;
      console.log('✅ WalletConnect inicializado correctamente');

    } catch (error) {
      console.error('❌ Error en inicialización de WalletConnect:', error);
      this.clearPersistedState();
      this.walletStateSubject.next(INITIAL_STATE);
    }
  }

  private async restoreConnectionState(): Promise<void> {
    try {
      const savedState = localStorage.getItem(this.STORAGE_KEY);
      if (!savedState) {
        console.log('📄 No hay estado persistido de wallet');
        return;
      }

      const state = JSON.parse(savedState);
      console.log('📋 Estado persistido encontrado:', state);

      // Validar que el estado guardado tenga los campos necesarios
      if (state.isConnected && state.address && state.chainId) {
        // Restaurar el estado en el BehaviorSubject
        this.walletStateSubject.next({
          isConnected: true,
          isConnecting: false,
          address: state.address,
          chainId: state.chainId,
          provider: null // Se establecerá después cuando AppKit esté listo
        });

        console.log('🔄 Estado de wallet restaurado temporalmente:', state.address);
      } else {
        console.log('⚠️ Estado persistido inválido, limpiando...');
        this.clearPersistedState();
      }
    } catch (error) {
      console.error('❌ Error restaurando estado de wallet:', error);
      this.clearPersistedState();
    }
  }

  private persistConnectionState(state: WalletState): void {
    try {
      if (state.isConnected && state.address && state.chainId) {
        const cleanState = {
          isConnected: state.isConnected,
          address: state.address,
          chainId: state.chainId,
          timestamp: Date.now()
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleanState));
        console.log('💾 Estado persistido:', cleanState);
      } else {
        // Limpiar si no está conectado
        this.clearPersistedState();
      }
    } catch (error) {
      console.error('❌ Error persistiendo estado:', error);
    }
  }

  private clearPersistedState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('🗑️ Estado persistido eliminado');
    } catch (error) {
      console.error('❌ Error limpiando estado persistido:', error);
    }
  }

  private async initializeAppKit(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const networks = [polygon, polygonAmoy];
        const ethersAdapter = new EthersAdapter();
        const defaultNetwork = environment.MATIC.chainId === 80002 ? polygonAmoy : polygon;

        this.appKit = createAppKit({
          adapters: [ethersAdapter],
          networks: networks,
          defaultNetwork: defaultNetwork,
          metadata: environment.WALLETCONNEC,
          projectId: this.projectId,
          features: {
            analytics: true,
            allWallets: true,
            email: false,
            socials: false,
            swaps: false,
            onramp: false,
          },
          enableAuthentication: false, // DESACTIVAR firma interna de Reown
        } as any);

        console.log('🔗 AppKit creado, configurando eventos...');
        this.subscribeToAppKitEvents();

        // Pequeña pausa para que AppKit se inicialice completamente
        setTimeout(() => resolve(), 500);

      } catch (error) {
        console.error('❌ Error inicializando AppKit:', error);
        resolve();
      }
    });
  }

  private siweSignatureData: any = null;

  public getSiweSignature() {
    const data = this.siweSignatureData;
    this.siweSignatureData = null; // Limpiar después de leer
    return data;
  }

  private subscribeToAppKitEvents(): void {
    // Limpiar suscripciones anteriores
    this.appKitSubscriptions.forEach(unsubscribe => unsubscribe());
    this.appKitSubscriptions = [];

    if (!this.appKit) return;

    try {
      // 1. Suscribirse a cambios de cuenta (ESENCIAL para TODAS las wallets)
      const unsubAccount = this.appKit.subscribeAccount(async (account: any) => {
        console.log('� AppKit Account Changed:', account.address, 'Connected:', account.isConnected);
        await this.updateConnectionState();
      });
      this.appKitSubscriptions.push(unsubAccount);

      // 2. Suscribirse a cambios de red
      const unsubNetwork = this.appKit.subscribeNetwork(async (network: any) => {
        console.log('🌐 AppKit Network Changed:', network.chainId);
        await this.updateConnectionState();
      });
      this.appKitSubscriptions.push(unsubNetwork);

      // 3. Suscribirse a eventos generales (opcional, para logs)
      const unsubEvents = this.appKit.subscribeEvents((event: any) => {
        const eventName = event.type || event.event || event.data?.event;
        console.log('📡 AppKit Event:', eventName);

        if (eventName === 'DISCONNECT_SUCCESS') {
          this.handleDisconnection();
        }

        // ESENCIAL: Detectar cuando se firma exitosamente a través del modal de Reown
        if (eventName === 'SIGN_MESSAGE_SUCCESS') {
          console.log('📝 Firma de SIWE/Reown exitosa');
          this.updateConnectionState();
        }

        if (eventName === 'SIGN_MESSAGE_ERROR') {
          console.log('❌ Error en firma de Reown');
          this.connectingWallet.next(false);
        }
      });
      this.appKitSubscriptions.push(unsubEvents);

    } catch (error) {
      console.error('❌ Error suscribiendo a eventos AppKit:', error);
    }
  }

  private async waitForAppKitReady(): Promise<void> {
    return new Promise((resolve) => {
      const maxAttempts = 20; // 2 segundos máximo
      let attempts = 0;

      const checkReady = () => {
        attempts++;

        if (this.appKit && typeof this.appKit.getWalletProvider === 'function') {
          console.log('✅ AppKit está listo');
          resolve();
          return;
        }

        if (attempts >= maxAttempts) {
          console.log('⚠️ AppKit no está completamente listo, continuando...');
          resolve();
          return;
        }

        setTimeout(checkReady, 100);
      };

      checkReady();
    });
  }

  public async updateConnectionState(): Promise<void> {
    try {
      if (!this.appKit) return;

      // Usar un bloque try para evitar que el error de "namespace" bloquee la UI
      let account;
      let network;
      try {
        account = this.appKit.getAccount('eip155');
        network = this.appKit.getNetwork('eip155');
      } catch (e) {
        console.log('ℹ️ Esperando a que el namespace eip155 esté disponible...');
        return;
      }

      const provider = this.appKit.getWalletProvider();

      if (!account || !account.isConnected || !account.address) {
        if (this.walletStateSubject.value.isConnected) {
          console.log('🔌 No hay cuenta conectada, manejando desconexión...');
          this.handleDisconnection();
        }
        return;
      }

      const address = account.address;
      const chainId = network?.chainId ? Number(network.chainId) : null;

      const newState: WalletState = {
        isConnected: true,
        isConnecting: false,
        address: address,
        chainId: chainId,
        provider: provider,
      };

      // Solo actualizar si realmente hay cambios
      const currentState = this.walletStateSubject.value;
      if (
        currentState.address?.toLowerCase() !== newState.address?.toLowerCase() ||
        currentState.chainId !== newState.chainId ||
        !currentState.isConnected
      ) {
        console.log('🔄 Actualizando estado de conexión:', {
          address: newState.address,
          chainId: newState.chainId,
          isConnected: newState.isConnected
        });

        this.walletStateSubject.next(newState);
        this.persistConnectionState(newState);
      }

    } catch (error) {
      console.error('❌ Error actualizando estado de conexión:', error);
      if (this.walletStateSubject.value.isConnected) {
        this.handleDisconnection();
      }
    }
  }

  private handleDisconnection(): void {
    console.log('🔌 Manejando desconexión completa');
    this.walletStateSubject.next(INITIAL_STATE);
    this.clearPersistedState();
    this.connectingWallet.next(false);
  }

  public async checkConnection(): Promise<boolean> {
    try {
      const provider = this.appKit?.getWalletProvider();
      if (!provider) {
        this.walletStateSubject.next(INITIAL_STATE);
        return false;
      }

      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      await signer.getAddress();

      return true;
    } catch (error) {
      this.walletStateSubject.next(INITIAL_STATE);
      return false;
    }
  }

  public isReady(): boolean {
    return this.isServiceReady;
  }

  public async waitForReady(): Promise<void> {
    if (this.isServiceReady) return;

    return new Promise((resolve) => {
      const checkReady = () => {
        if (this.isServiceReady) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  }

  private async getSigner(): Promise<ethers.Signer | null> {
    const provider = this.appKit.getWalletProvider();
    if (!provider) {
      console.error("Provider not available");
      return null;
    }
    const ethersProvider = new BrowserProvider(provider);
    return await ethersProvider.getSigner();
  }

  getWeb3Modal(): any {
    return this.appKit;
  }

  async signMessage(message: string) {
    const signer = await this.getSigner();
    if (!signer) {
      throw new Error('Signer not available. Please ensure your wallet is connected.');
    }

    const signature = await signer.signMessage(message);
    return {
      signature,
      message,
    };
  }

  async getChainId() {
    if (this.appKit.getWalletProvider()) {
      const provider = new BrowserProvider(this.appKit.getWalletProvider());
      const network = await provider.getNetwork();
      const chainId = network.chainId;
      return chainId;
    }
    return null;
  }

  async switchNetwork(): Promise<void> {
    const provider = await this.appKit.getWalletProvider();
    if (provider) {
      console.log(
        'Switching network to:',
        environment.NAMECHAINS[environment.CHAINPOSITION].hexChainId,
      );
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [
            {
              chainId: environment.NAMECHAINS[environment.CHAINPOSITION].hexChainId,
            },
          ],
        });
      } catch (error) {
        console.error('Error switching network:', error);
      }
    }
  }

  async getConnectedWalletAddress(): Promise<string> {
    try {
      const provider = await this.appKit.getWalletProvider();
      if (!provider) {
        throw new Error('No wallet connected');
      }
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      return address;
    } catch (error) {
      console.error('Error getting connected wallet address:', error);
      throw error;
    }
  }

  async getWalletBalance(): Promise<string> {
    try {
      const provider = await this.appKit.getWalletProvider();
      if (!provider) {
        throw new Error('No wallet connected');
      }
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      const balance = await ethersProvider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      throw error;
    }
  }

  async getERC20Balance(decimals: number, contractAddress: string, abi: any): Promise<string | null> {
    const signer = await this.getSigner();
    if (!signer) return null;

    const address = await signer.getAddress();
    const erc20Contract = new ethers.Contract(contractAddress, abi, signer);
    const balance = await erc20Contract['balanceOf'](address);
    return formatUnits(balance, decimals);
  }

  ngOnDestroy(): void {
    this.appKitSubscriptions.forEach(unsubscribe => unsubscribe());
    this.clearPersistedState();
  }
}
