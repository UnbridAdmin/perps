import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BalanceOverviewComponent } from './components/balance-overview/balance-overview.component';
import { ProfitLossComponent } from './components/profit-loss/profit-loss.component';
import { YouWonComponent } from './components/you-won/you-won.component';
import { HistoryComponent } from './components/history/history.component';

@Component({
  selector: 'app-balance-activity',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    BalanceOverviewComponent,
    ProfitLossComponent,
    YouWonComponent,
    HistoryComponent
  ],
  templateUrl: './balance-activity.component.html',
  styleUrls: ['./balance-activity.component.scss']
})
export class BalanceActivityComponent {
  username: string = 'User'; // Should come from a service
  
  constructor() {
    // Inject services to get real data
  }
}
