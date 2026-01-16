import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TradeService } from '../trade.service';
import { AuthorizationService } from '../../services/authorization.service';
import moment from 'moment';
import { WalletConnectService } from '../../services/walletconnect.service';

@Component({
  selector: 'app-trading-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trading-panel.component.html',
  styleUrl: './trading-panel.component.scss',
})
export class TradingPanelComponent implements OnInit {
  @Input() predictionOptionId: number = 1;
  @Input() userShares: number = 0;

  isBuyMode = true;
  selectedOption: 'yes' | 'no' = 'yes';
  amount = 2;
  sharesToSell = 1;
  maxAmount = 100;

  yesPrice = 97.4;
  noPrice = 3.7;
  avgPrice = 97.4;

  isLoading = false;

  constructor(
    private tradeService: TradeService,
    private authService: AuthorizationService,
    private walletConnectService: WalletConnectService
  ) {}

  ngOnInit() {
    // Initialize component
  }

  get toWin(): number {
    // If buying at yesPrice, potential win = amount / (yesPrice/100)
    const price = this.selectedOption === 'yes' ? this.yesPrice : this.noPrice;
    return parseFloat(((this.amount / (price / 100)) - this.amount).toFixed(2));
  }

  setAmount(value: number) {
    this.amount = Math.min(this.amount + value, this.maxAmount);
  }

  setMaxAmount() {
    this.amount = this.maxAmount;
  }

  executeTrade() {
    if (this.isBuyMode) {
      this.buyVote();
    } else {
      this.sellVote();
    }
  }

  async buyVote(): Promise<void> {
    // Check if user has authentication token (registered user)
    const hasAuthToken = this.authService.isAuthenticated();

    // Check if user has wallet connection (for wallet-only users)
    const hasWalletConnection = await this.walletConnectService.checkConnection();

    if (!hasAuthToken && !hasWalletConnection) {
      console.error('User must be authenticated or have wallet connection to buy votes');
      return;
    }

    this.isLoading = true;

    const buyVoteParams: any = {
      prediction_option_multiple_id: this.predictionOptionId,
      side: this.selectedOption.toUpperCase(),
      amount_usd: this.amount
    };

    // If user is wallet-connected but not token-authenticated, add signature data
    if (!hasAuthToken && hasWalletConnection) {
      const walletData = await this.generateWalletSignature();
      if (walletData) {
        buyVoteParams.message = walletData.message;
        buyVoteParams.signature = walletData.signature;
        buyVoteParams.coin_id = walletData.coin_id || 1; // Default to 1 if not specified
      }
    }

    const buyMethod = hasAuthToken ? this.tradeService.buyVote(buyVoteParams) : this.tradeService.buyPublicVote(buyVoteParams);

    buyMethod.subscribe({
      next: (response: any) => {
        this.isLoading = false;

        // Handle authentication response for public votes
        if (!hasAuthToken && response.data && Array.isArray(response.data) && response.data.length >= 2) {
          // Extract auth data and buy vote data from response
          const authData = response.data[0]; // AuthResponse object
          const buyVoteData = response.data[1]; // BuyVoteResponse object

          // Store authentication token if provided
          if (authData && authData.expires) {
            localStorage.setItem('expirationDate', authData.expires);
            // Set security token cookie (this should be handled by the browser from the response cookie)
          }

          // Check buy vote success
          if (buyVoteData?.success) {
            console.log('Vote purchased successfully:', buyVoteData);
            // Handle success - maybe update prices, show confirmation, etc.
          } else {
            console.error('Error purchasing vote:', buyVoteData?.message);
          }
        } else {
          // Handle regular authenticated response
          if (response.data?.success) {
            console.log('Vote purchased successfully:', response.data);
            // Handle success - maybe update prices, show confirmation, etc.
          } else {
            console.error('Error purchasing vote:', response.data?.message);
          }
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error purchasing vote:', error);
      }
    });
  }

  /**
   * Generate wallet signature data for public vote purchase
   */
  private async generateWalletSignature(): Promise<{ message: string; signature: string; coin_id?: number } | null> {
    try {
      const walletAddress = await this.walletConnectService.getConnectedWalletAddress();

      // Create a message for signing
      const message = `Buy vote for prediction option ${this.predictionOptionId} with ${this.amount} USD at ${new Date().toISOString()}`;

      // Sign the message
      const signatureData = await this.walletConnectService.signMessage(message);

      return {
        message: signatureData.message,
        signature: signatureData.signature,
        coin_id: 1 // Default coin_id, adjust as needed
      };
    } catch (error) {
      console.error('Error generating wallet signature:', error);
      return null;
    }
  }

  sellVote() {
    if (!this.authService.isAuthenticated()) {
      console.error('User must be authenticated to sell votes');
      return;
    }

    if (this.userShares <= 0) {
      console.error('No shares available to sell');
      return;
    }

    this.isLoading = true;

    const sellVoteParams = {
      prediction_option_multiple_id: this.predictionOptionId,
      side: this.selectedOption.toUpperCase(),
      shares_to_sell: this.sharesToSell
    };

    this.tradeService.sellVote(sellVoteParams).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.data?.success) {
          console.log('Shares sold successfully:', response.data);
          // Update user shares
          this.userShares = Math.max(0, this.userShares - this.sharesToSell);
        } else {
          console.error('Error selling shares:', response.data?.message);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error selling shares:', error);
      }
    });
  }
}
