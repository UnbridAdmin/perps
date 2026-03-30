import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BetRoutingModule } from './bet-routing.module';
import { BetDetailComponent } from './bet-detail/bet-detail.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BetRoutingModule,
    BetDetailComponent,
  ]
})
export class BetModule { }
