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
  limitPrice = '8¢';
  shares = 0;

  get total(): number {
    const price = parseInt(this.limitPrice) || 0;
    return (price * this.shares) / 100;
  }

  get toWin(): number {
    return this.shares - this.total;
  }

  increasePrice() {
    const current = parseInt(this.limitPrice) || 0;
    this.limitPrice = `${current + 1}¢`;
  }

  decreasePrice() {
    const current = parseInt(this.limitPrice) || 0;
    if (current > 0) {
      this.limitPrice = `${current - 1}¢`;
    }
  }

  adjustShares(amount: number) {
    this.shares = Math.max(0, this.shares + amount);
  }
}
