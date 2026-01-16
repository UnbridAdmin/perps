import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OutcomeComponent } from '../outcome/outcome.component';
import { TradingPanelComponent } from '../trading-panel/trading-panel.component';
import { CommentsComponent } from '../comments/comments.component';
import { PriceTrendComponent } from '../price-trend/price-trend.component';
import { TradeService } from '../trade.service';

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
  isLoading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tradeService: TradeService
  ) {}

  ngOnInit() {
    // Get prediction ID from route params
    this.route.params.subscribe(params => {
      this.predictionId = +params['id'] || 0;
      if (this.predictionId) {
        this.loadTradeDetails();
      }
    });
  }

  loadTradeDetails() {
    this.isLoading = true;
    this.tradeService.getTradeDetails({ prediction_id: this.predictionId }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.data?.success) {
          this.tradeData = this.tradeService.mapTradeDetailsResponse(response);
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
