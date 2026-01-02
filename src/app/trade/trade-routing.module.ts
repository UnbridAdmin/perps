import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TradeDetailComponent } from './trade-detail/trade-detail.component';

const routes: Routes = [
  { path: 'trade', component: TradeDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TradeRoutingModule { }
