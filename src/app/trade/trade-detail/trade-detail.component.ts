import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OutcomeComponent } from '../outcome/outcome.component';
import { TradingPanelComponent } from '../trading-panel/trading-panel.component';
import { CommentsComponent } from '../comments/comments.component';
import { PriceTrendComponent } from '../price-trend/price-trend.component';
import { TradeService } from '../trade.service';
import { AuthorizationService } from '../../services/authorization.service';
import { WalletConnectService } from '../../services/walletconnect.service';

@Component({
  selector: 'app-trade-detail',
  standalone: true,
  imports: [CommonModule, OutcomeComponent, TradingPanelComponent, CommentsComponent, PriceTrendComponent],
  templateUrl: './trade-detail.component.html',
  styleUrl: './trade-detail.component.scss',
})
export class TradeDetailComponent implements OnInit {
  predictionId: number = 0;
  tradeData: any = null;
  selectedOptionData: any = null;
  isLoading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tradeService: TradeService,
    private authService: AuthorizationService,
    private walletConnectService: WalletConnectService
  ) { }

  ngOnInit() {
    // Get prediction ID from route params
    this.route.params.subscribe(params => {
      this.predictionId = +params['id'] || 0;
      if (this.predictionId) {
        this.loadTradeDetails();
      }
    });
  }

  async loadTradeDetails(): Promise<void> {
    this.isLoading = true;

    // Check both authentication and wallet connection
    const isAuthenticated = this.authService.isAuthenticated();
    const isWalletConnected = await this.walletConnectService.checkConnection();

    const apiCall = (isAuthenticated && isWalletConnected)
      ? this.tradeService.getTradeDetails({ prediction_id: this.predictionId })
      : this.tradeService.getTradePublicDetails({ prediction_id: this.predictionId });

    apiCall.subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.data?.success) {
          this.tradeData = this.tradeService.mapTradeDetailsResponse(response);
          if (this.tradeData && this.tradeData.options && this.tradeData.options.length > 0) {
            this.selectedOptionData = this.tradeData.options[0];
          }
        } else {
          console.error('Error loading trade details:', response.data?.message);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading trade details:', error);
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
