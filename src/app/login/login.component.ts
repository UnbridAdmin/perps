import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WalletConnectService } from '../services/walletconnect.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Welcome to Perps</h2>
        <p>Please connect your wallet to continue</p>
        <button class="connect-btn" (click)="connectWallet()">Connect Wallet</button>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 400px;
      width: 100%;
    }

    h2 {
      color: #333;
      margin-bottom: 1rem;
    }

    p {
      color: #666;
      margin-bottom: 2rem;
    }

    .connect-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .connect-btn:hover {
      transform: translateY(-2px);
    }
  `]
})
export class LoginComponent implements OnInit {

  constructor(
    private walletConnectService: WalletConnectService,
    private router: Router
  ) { }

  ngOnInit() {
    // Prevent double execution if called immediately
    setTimeout(() => {
      this.connectWallet();
    }, 500);
  }

  async connectWallet() {
    await this.walletConnectService.connectWallet();
  }
}