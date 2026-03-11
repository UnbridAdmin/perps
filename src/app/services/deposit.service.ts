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

    // 0. If NOT authenticated, request signature FIRST
    const isAuthenticated = this.authService.isAuthenticated();
    let signResult = null;
    let message = '';

    if (!isAuthenticated) {
      message = `I authorize the deposit of ${amount} FIERCE particles in perps platform`;
      console.log('Requesting signature before transaction...');
      signResult = await this.walletService.signMessage(message);
    }

    // 1. Perform the blockchain transaction (Confirm amount)
    const provider = await this.walletService.getWeb3Modal().getWalletProvider();
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Standard ERC20 Transfer ABI
    const abi = [
      "function transfer(address to, uint256 amount) public returns (bool)"
    ];

    const fierceContract = new ethers.Contract(fierceAddress, abi, signer);
    const parsedAmount = ethers.parseUnits(amount.toString(), decimals);

    console.log(`Sending ${amount} FIERCE to ${vaultAddress}...`);
    const tx = await fierceContract['transfer'](vaultAddress, parsedAmount);
    console.log('Transaction sent:', tx.hash);
    
    // 2. Wait for 4 confirmations as requested
    console.log('Waiting for 4 confirmations...');
    await tx.wait(4); 
    console.log('Transaction confirmed with 4 blocks.');

    // 3. Call the backend with the hash and signature
    return this.notifyBackend(tx.hash, amount, walletAddress, signResult, message);
  }

  private async notifyBackend(hash: string, amount: string, walletAddress: string, signResult?: any, signedMessage?: string): Promise<any> {
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
      // Uses the signature obtained at the beginning
      const payload = {
        hash: hash,
        amount: amount,
        signature: signResult.signature,
        message: signedMessage,
        coin_id: 1 // Assuming 1 is FIERCE
      };

      return this.apiService.publicApiCall('/user/secure-deposit-funds', 'POST', payload).toPromise();
    }
  }
}
