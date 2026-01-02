import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
  { path: 'trade', loadChildren: () => import('./trade/trade.module').then(m => m.TradeModule) },
  // Add more routes for modules here
];
