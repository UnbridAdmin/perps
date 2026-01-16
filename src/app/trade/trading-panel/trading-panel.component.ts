import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TradeService } from '../trade.service';
import { AuthorizationService } from '../../services/authorization.service';

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
    private authService: AuthorizationService
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

  buyVote() {
    if (!this.authService.isAuthenticated()) {
      console.error('User must be authenticated to buy votes');
      return;
    }

    this.isLoading = true;

    const buyVoteParams = {
      prediction_option_multiple_id: this.predictionOptionId,
      side: this.selectedOption.toUpperCase(),
      amount_usd: this.amount
    };

    this.tradeService.buyVote(buyVoteParams).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.data?.success) {
          console.log('Vote purchased successfully:', response.data);
          // Handle success - maybe update prices, show confirmation, etc.
        } else {
          console.error('Error purchasing vote:', response.data?.message);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error purchasing vote:', error);
      }
    });
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
