import { Component } from '@angular/core';
import { OutcomeComponent } from '../outcome/outcome.component';
import { TradingPanelComponent } from '../trading-panel/trading-panel.component';
import { CommentsComponent } from '../comments/comments.component';
import { PriceTrendComponent } from '../price-trend/price-trend.component';

@Component({
  selector: 'app-trade-detail',
  standalone: true,
  imports: [OutcomeComponent, TradingPanelComponent, CommentsComponent, PriceTrendComponent],
  templateUrl: './trade-detail.component.html',
  styleUrl: './trade-detail.component.scss',
})
export class TradeDetailComponent {

}
