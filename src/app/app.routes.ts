import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  { path: 'create-prediction', loadComponent: () => import('./create-prediction/create-prediction.component').then(m => m.CreatePredictionComponent) },
  { path: 'trade', loadChildren: () => import('./trade/trade.module').then(m => m.TradeModule) },
  { path: 'bet', loadChildren: () => import('./bet/bet.module').then(m => m.BetModule) },
  { path: 'profile', loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule) },
  { path: 'balance-activity', loadComponent: () => import('./balance-activity/balance-activity.component').then(m => m.BalanceActivityComponent) },
  { path: 'post/:id', loadComponent: () => import('./shared/post-prediction/post-detail/post-detail.component').then(m => m.PostDetailComponent) },
  { path: 'referral', loadComponent: () => import('./referral/referral.component').then(m => m.ReferralComponent) },
  { path: ':username', loadComponent: () => import('./profile/profile-detail/profile-detail.component').then(m => m.ProfileDetailComponent) },
];
