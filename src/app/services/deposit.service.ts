import { Injectable } from '@angular/core';
import { ApiServices } from './api.service';
import { WalletConnectService } from './walletconnect.service';
import { AuthorizationService } from './authorization.service';
import { environment } from '../../environments/environment';
import { ethers } from 'ethers';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DepositService {

  constructor(
    private apiService: ApiServices,
    private walletService: WalletConnectService,
    private authService: AuthorizationService
  ) { }

  /**
   * Sends FIERCE tokens to the vault address and then notifies the backend.
   * @param amount The amount of FIERCE to deposit.
   */
  async depositFierce(amount: string): Promise<any> {
    const isConnected = await this.walletService.checkConnection();
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    const walletAddress = await this.walletService.getConnectedWalletAddress();
    const vaultAddress = environment.VAULT_ADDRESS;
    const fierceAddress = environment.FIERCECONTRACTADDRESS;
    const decimals = environment.DECIMALFIERCE || 18;

    // 1. Perform the blockchain transaction
    const provider = await this.walletService.getWeb3Modal().getWalletProvider();
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Standard ERC20 Transfer ABI
    const abi = [
      "function transfer(address to, uint256 amount) public returns (bool)"
    ];

    const fierceContract = new ethers.Contract(fierceAddress, abi, signer);
    const parsedAmount = ethers.parseUnits(amount, decimals);

    console.log(`Sending ${amount} FIERCE to ${vaultAddress}...`);
    const tx = await fierceContract['transfer'](vaultAddress, parsedAmount);
    console.log('Transaction sent:', tx.hash);
    
    // Wait for transaction to be mined (optional but recommended for UX)
    // await tx.wait(); 

    // 2. Call the backend with the hash
    return this.notifyBackend(tx.hash, amount, walletAddress);
  }

  private async notifyBackend(hash: string, amount: string, walletAddress: string): Promise<any> {
    const isAuthenticated = this.authService.isAuthenticated();

    if (isAuthenticated) {
      // For authenticated users, use /user/deposit-funds
      const payload = {
        hash: hash,
        amount: amount
      };
      return this.apiService.apiCall('/user/deposit-funds', 'POST', payload).toPromise();
    } else {
      // For unauthenticated users, use /user/secure-deposit-funds
      // Requires signature
      const message = `Deposit ${amount} FIERCE with hash ${hash}`;
      const signResult = await this.walletService.signMessage(message);

      const payload = {
        hash: hash,
        amount: amount,
        signature: signResult.signature,
        message: message,
        coin_id: 1 // Assuming 1 is FIERCE or specific coin ID
      };

      return this.apiService.publicApiCall('/user/secure-deposit-funds', 'POST', payload).toPromise();
    }
  }
}
