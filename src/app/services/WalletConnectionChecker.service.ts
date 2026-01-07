import { Injectable, NgZone } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { WalletConnectService } from './walletconnect.service';

@Injectable({
  providedIn: 'root'
})
export class WalletConnectionCheckerService {
  private checkInterval = 5 * 60 * 1000; // 5 minutos
  private checkSubscription: Subscription;

  constructor(
    private walletService: WalletConnectService,
    private ngZone: NgZone
  ) {}

  startPeriodicCheck() {
    this.ngZone.runOutsideAngular(() => {
      this.checkSubscription = interval(this.checkInterval).subscribe(() => {
        this.ngZone.run(() => this.checkWalletConnection());
      });
    });
  }

  stopPeriodicCheck() {
    if (this.checkSubscription) {
      this.checkSubscription.unsubscribe();
    }
  }

  private async checkWalletConnection() {
    try {
        const isConnected = await this.walletService.checkConnection();
        if (isConnected) {
          console.log('Wallet is connected');
        } else {
          console.log('Wallet is not connected');
        }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  }
}