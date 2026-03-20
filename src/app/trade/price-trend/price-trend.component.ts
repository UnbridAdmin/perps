import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PriceTrendService, IntuitionMarketGapData } from './price-trend.service';
import { Subscription } from 'rxjs';

// TODO: Move to shared models when creating services
interface MarketOption {
  id: string;
  name: string;
  fierceIntuition: number; // Percentage from community votes
  marketPrice: number; // Real market percentage
  volume: string; // Trading volume
  gap: number;
}

interface PredictionData {
  type: 'binary' | 'multiple'; // Binary: Yes/No, Multiple: Several options
  options: MarketOption[];
}

@Component({
  selector: 'app-price-trend',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './price-trend.component.html',
  styleUrl: './price-trend.component.scss',
})
export class PriceTrendComponent implements OnInit, OnDestroy {
  predictionData: PredictionData | null = null;
  showInfoPopover = false;
  private routeSub: Subscription | null = null;
  private dataSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private priceTrendService: PriceTrendService
  ) {}

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      const predictionId = params['id'];
      if (predictionId) {
        this.loadData(predictionId);
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) this.routeSub.unsubscribe();
    if (this.dataSub) this.dataSub.unsubscribe();
  }

  private loadData(predictionId: number) {
    this.dataSub = this.priceTrendService.getIntuitionMarketGap(predictionId).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.mapData(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading intuition market gap data:', error);
      }
    });
  }

  private mapData(apiData: IntuitionMarketGapData[]) {
    const options: MarketOption[] = apiData.map(item => ({
      id: item.prediction_option_id.toString(),
      name: item.prediction_option_title,
      fierceIntuition: Math.round(item.intuition_percentage),
      marketPrice: Math.round(item.market_percentage * 100),
      volume: this.formatVolume(item.option_amount_usdt),
      gap: Math.round(item.gap)
    }));

    // Determine if it's binary or multiple
    // Binary if exactly 2 options and titles are "SÍ"/"NO" or similar
    const isBinary = options.length === 2 && 
      (options.some(o => o.name.toUpperCase() === 'SÍ' || o.name.toUpperCase() === 'YES') ||
       options.some(o => o.name.toUpperCase() === 'NO'));

    this.predictionData = {
      type: isBinary ? 'binary' : 'multiple',
      options: options
    };
  }

  private formatVolume(amount: number): string {
    if (!amount) return '$0';
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${Math.round(amount)}`;
  }

  toggleInfoPopover() {
    this.showInfoPopover = !this.showInfoPopover;
  }

  closeInfoPopover() {
    this.showInfoPopover = false;
  }


  getGap(option: MarketOption): number {
    return option.fierceIntuition - option.marketPrice;
  }

  getBarWidth(value: number): string {
    return `${value}%`;
  }

  Math = Math; // Expose Math to template
}
