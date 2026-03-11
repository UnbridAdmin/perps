import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-balance-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './balance-overview.component.html',
  styleUrls: ['./balance-overview.component.scss']
})
export class BalanceOverviewComponent {
  @Input() portfolioValue: number = 6.08;
  @Input() dailyChange: number = 0;
  @Input() availableToTrade: number = 4.00;

  onDeposit() {
    console.log('Deposit');
  }

  onWithdraw() {
    console.log('Withdraw');
  }
}
