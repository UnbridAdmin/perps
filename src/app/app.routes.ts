import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  { path: 'trade', loadChildren: () => import('./trade/trade.module').then(m => m.TradeModule) },
  { path: 'profile', loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule) },
  { path: 'balance-activity', loadComponent: () => import('./balance-activity/balance-activity.component').then(m => m.BalanceActivityComponent) },
  { path: ':username', loadComponent: () => import('./profile/profile-detail/profile-detail.component').then(m => m.ProfileDetailComponent) },
];
