import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WalletConnectService } from '../services/walletconnect.service';
import { CommonService } from '../shared/commonService';
import { AuthorizationService } from '../services/authorization.service';
import { ApiServices } from '../services/api.service';
import { CacheService } from '../services/cache.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-referral',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.scss']
})
export class ReferralComponent implements OnInit, OnDestroy {

  referralCode: string = '';
  isConnecting = false;
  isSuccess = false;
  errorMessage = '';
  countdown = 3;
  
  // Countdown timer variables
  daysRemaining = 7;
  hoursRemaining = 0;
  minutesRemaining = 0;

  private subscriptions: Subscription = new Subscription();
  private isProcessingConnection = false; // Flag to prevent multiple signature requests
  private countdownInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private walletConnectService: WalletConnectService,
    private commonService: CommonService,
    private authorizationService: AuthorizationService,
    private apiService: ApiServices,
    private cacheService: CacheService
  ) { }

  ngOnInit(): void {
    // Initialize countdown timer
    this.startOfferCountdown();

    // Read the referral code from query params: /referral?code=XXXXX
    this.subscriptions.add(
      this.route.queryParams.subscribe(params => {
        this.referralCode = params['code'] || '';
        if (this.referralCode) {
          // Persist the referral code so the wallet-connect flow can use it
          sessionStorage.setItem('pendingReferralCode', this.referralCode);
        }
      })
    );

    // Listen for wallet account changes to detect when the user connects
    const web3Modal = this.walletConnectService.getWeb3Modal();
    if (web3Modal?.subscribeAccount) {
      const unsubscribe = web3Modal.subscribeAccount((account: any) => {
        if (account?.address && this.isConnecting && !this.isProcessingConnection) {
          this.handleWalletConnected(account.address.toLowerCase());
        }
      });
      // Store the unsubscribe function for cleanup
      this.subscriptions.add(new Subscription(() => unsubscribe?.()));
    }
  }

  async connectAndRegister(): Promise<void> {
    if (this.isConnecting) return;

    if (!this.referralCode) {
      this.errorMessage = 'Invalid referral link. Please ask your friend for their referral link.';
      return;
    }

    try {
      this.isConnecting = true;
      this.errorMessage = '';

      // If already authenticated, just redirect
      if (this.authorizationService.isAuthenticated()) {
        this.router.navigate(['/home']);
        return;
      }

      await this.walletConnectService.connectWallet();

    } catch (error) {
      console.error('Error connecting wallet:', error);
      this.isConnecting = false;
      this.errorMessage = 'Connection failed. Please try again.';
    }
  }

  private async handleWalletConnected(address: string): Promise<void> {
    // Prevent multiple signature requests
    if (this.isProcessingConnection) {
      console.log('Connection already being processed, skipping...');
      return;
    }

    this.isProcessingConnection = true;

    try {
      // Request signature
      const signatureData = await this.walletConnectService.signMessage(
        `Click to sign in and accept the Unbrid Terms of Service(https://unbrid.com/privacy-policy). Login with secure code:${this.commonService.generateUniqueUUID()}`
      );

      // Call secure-referral-user endpoint
      const payload = {
        message: signatureData.message,
        signature: signatureData.signature,
        coin_id: 1,
        referral_code: this.referralCode
      };

      const resp: any = await this.apiService.publicApiCall('user/secure-referral-user', 'POST', payload)?.toPromise();

      // Save session
      this.commonService.saveAccountAddress(address);
      this.authorizationService.setSession(resp.data[0].expires, address);
      this.cacheService.set('signatureData', {
        message: signatureData.message,
        signature: signatureData.signature
      });
      this.walletConnectService.updateBalance.next(true);
      this.commonService.updateUserAddress.next(true);

      // Clean up
      sessionStorage.removeItem('pendingReferralCode');

      // Show success and redirect
      this.isSuccess = true;
      this.isConnecting = false;
      this.startCountdownRedirect();

    } catch (error) {
      console.error('Error in referral registration:', error);
      this.isProcessingConnection = false;
      this.isConnecting = false;
      this.errorMessage = 'Something went wrong. Please try again.';
    }
  }

  private startCountdownRedirect(): void {
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(interval);
        this.router.navigate(['/home']);
      }
    }, 1000);
  }

  private startOfferCountdown(): void {
    // Update countdown every minute
    const updateCountdown = () => {
      const now = new Date();
      const expiryDate = new Date(now);
      expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now

      const timeRemaining = expiryDate.getTime() - now.getTime();
      const daysMs = 24 * 60 * 60 * 1000;
      const hoursMs = 60 * 60 * 1000;
      const minutesMs = 60 * 1000;

      this.daysRemaining = Math.floor(timeRemaining / daysMs);
      this.hoursRemaining = Math.floor((timeRemaining % daysMs) / hoursMs);
      this.minutesRemaining = Math.floor((timeRemaining % hoursMs) / minutesMs);
    };

    updateCountdown();
    this.countdownInterval = setInterval(updateCountdown, 60000); // Update every minute
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}