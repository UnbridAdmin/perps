import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BetDetailComponent } from './bet-detail/bet-detail.component';

const routes: Routes = [
  { path: ':id', component: BetDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BetRoutingModule { }
