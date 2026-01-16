import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TradingPanelService } from './trading-pnael.service';
import { AuthorizationService } from '../../services/authorization.service';

@Component({
  selector: 'app-trading-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trading-panel.component.html',
  styleUrl: './trading-panel.component.scss',
})
export class TradingPanelComponent {
  isBuyMode = true;
  selectedOption: 'yes' | 'no' = 'yes';
  amount = 2;
  maxAmount = 100;

  yesPrice = 97.4;
  noPrice = 3.7;
  avgPrice = 97.4;

  isLoading = false;

  constructor(
    private tradingPanelService: TradingPanelService,
    private authService: AuthorizationService
  ) {}

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

  buyVote() {
    if (!this.authService.isAuthenticated()) {
      console.error('User must be authenticated to buy votes');
      return;
    }

    this.isLoading = true;

    const buyVoteParams = {
      prediction_option_multiple_id: 1, // This should be provided from the prediction context
      side: this.selectedOption.toUpperCase(),
      amount_usd: this.amount
    };

    this.tradingPanelService.buyVote(buyVoteParams).subscribe({
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
}
