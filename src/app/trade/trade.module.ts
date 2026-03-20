import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TradeRoutingModule } from './trade-routing.module';
import { TradeDetailComponent } from './trade-detail/trade-detail.component';
import { OrderBookComponent } from './order-book/order-book.component';
import { GraphComponent } from './graph/graph.component';
import { ResolutionComponent } from './resolution/resolution.component';
import { TradingPanelComponent } from './trading-panel/trading-panel.component';
import { OutcomeComponent } from './outcome/outcome.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TradeRoutingModule,
    TradeDetailComponent,
    OrderBookComponent,
    GraphComponent,
    ResolutionComponent,
    TradingPanelComponent,
    OutcomeComponent,
  ]
})
export class TradeModule { }
