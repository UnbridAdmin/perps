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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
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
        const ethersAdapter = new EthersAdapter();
        const network = environment.MATIC.chainId === 80002 ? polygonAmoy : polygon;

        this.appKit = createAppKit({
          adapters: [ethersAdapter],
          networks: [network],
          metadata: environment.WALLETCONNEC,
          projectId: this.projectId,
          features: { analytics: true },
        });

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

  private subscribeToAppKitEvents(): void {
    // Limpiar suscripciones anteriores
    this.appKitSubscriptions.forEach(unsubscribe => unsubscribe());
    this.appKitSubscriptions = [];

    if (!this.appKit) return;

    try {
      const onEvents = this.appKit.subscribeEvents(async (event: any) => {
        console.log('📡 AppKit Event:', event.type, event.data?.event);

        switch (event.type) {
          case 'accountsChanged':
          case 'chainChanged':
          case 'connectionChanged':
            await this.updateConnectionState();
            break;
        }

        if (event.data?.event === 'CONNECT_SUCCESS') {
          console.log('🎉 Conexión exitosa detectada');
          await this.updateConnectionState();
        }

        if (event.data?.event === 'DISCONNECT_SUCCESS') {
          console.log('👋 Desconexión detectada');
          this.handleDisconnection();
        }
      });

      this.appKitSubscriptions.push(onEvents);
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
      if (!this.appKit) {
        console.log('⚠️ AppKit no disponible para actualizar estado');
        return;
      }

      const provider = this.appKit.getWalletProvider();
      if (!provider) {
        // Solo actualizar si actualmente creemos que estamos conectados
        if (this.walletStateSubject.value.isConnected) {
          console.log('🔌 Provider no disponible, desconectando...');
          this.handleDisconnection();
        }
        return;
      }

      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      const network = await ethersProvider.getNetwork();
      const chainId = Number(network.chainId);

      const newState: WalletState = {
        isConnected: true,
        isConnecting: false,
        address,
        chainId,
        provider,
      };

      // Solo actualizar si realmente hay cambios
      const currentState = this.walletStateSubject.value;
      if (
        currentState.address !== newState.address ||
        currentState.chainId !== newState.chainId ||
        !currentState.isConnected
      ) {
        console.log('🔄 Actualizando estado de conexión:', {
          address: newState.address,
          chainId: newState.chainId
        });

        this.walletStateSubject.next(newState);
        this.persistConnectionState(newState);
      }

    } catch (error) {
      console.error('❌ Error actualizando estado de conexión:', error);
      // Solo desconectar si actualmente estamos conectados
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
    const provider = new BrowserProvider(this.appKit.getWalletProvider());
    const signer = await provider.getSigner();
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
