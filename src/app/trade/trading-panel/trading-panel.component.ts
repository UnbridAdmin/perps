import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
}
