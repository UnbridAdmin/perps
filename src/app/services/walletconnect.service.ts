import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BrowserProvider, ethers } from 'ethers';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { createAppKit } from '@reown/appkit';
import { polygon } from '@reown/appkit/networks';
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

    this.appKit = createAppKit({
      adapters: [ethersAdapter],
      networks: [polygon],
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
}
