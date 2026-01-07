import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BrowserProvider, ethers } from 'ethers';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { createAppKit } from '@reown/appkit';
import { polygon } from '@reown/appkit/networks';

@Injectable()
export class WalletConnectService {
  appKit: any;
  updateBalance: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  connectingWallet: BehaviorSubject<any> = new BehaviorSubject<any>(false);

  projectId = 'f3f854530d520e7e0480a24ac2bf79c7';

  constructor() {
    this.initializeAppKit();
  }

  private initializeAppKit() {
    const ethersAdapter = new EthersAdapter();
    const metadata = {
      name: 'Perps',
      description: 'Perps App',
      url: 'https://perps.unbrid.com',
      icons: ['https://perps.unbrid.com/assets/icon.png'],
    };

    this.appKit = createAppKit({
      adapters: [ethersAdapter],
      networks: [polygon],
      metadata: metadata,
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
    const address = await signer.getAddress();
    return {
      signature,
      message,
    };
  }
}