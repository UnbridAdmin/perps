import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BrowserProvider, ethers } from 'ethers';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { createAppKit } from '@reown/appkit';
import { polygon, polygonAmoy } from '@reown/appkit/networks';
import { environment } from '../../environments/environment';

@Injectable()
export class WalletConnectService {
  appKit: any;
  updateBalance: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  connectingWallet: BehaviorSubject<any> = new BehaviorSubject<any>(false);

  projectId = environment.WALLETCONNEC.projectId;

  constructor() {
    this.initializeAppKit();
  }

  private initializeAppKit() {
    const ethersAdapter = new EthersAdapter();

    let network;
    if (environment.MATIC.chainId == 80002) {
      network = polygonAmoy;
    } else {
      network = polygon;
    }

    this.appKit = createAppKit({
      adapters: [ethersAdapter],
      networks: [network],
      metadata: environment.WALLETCONNEC,
      projectId: this.projectId,
      features: {
        analytics: true
      }
    });
  }

  getWeb3Modal(): any {
    return this.appKit;
  }

  async checkConnection(): Promise<boolean> {
    try {
      const provider = await this.appKit.getWalletProvider();
      if (!provider) {
        return false;
      }
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      await signer.getAddress();
      return true;
    } catch (error) {
      return false;
    }
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
}
