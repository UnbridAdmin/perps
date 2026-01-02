import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// TODO: Move to shared models when creating services
interface MarketOption {
  id: string;
  name: string;
  fierceIntuition: number; // Percentage from community votes
  marketPrice: number; // Real market percentage
  volume: string; // Trading volume
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
export class PriceTrendComponent implements OnInit {
  predictionData: PredictionData | null = null;
  showInfoPopover = false;

  ngOnInit() {
    // TODO: Replace with actual service call
    // Example: this.predictionService.getPredictionData(predictionId).subscribe(...)
    this.loadMockData();
  }

  toggleInfoPopover() {
    this.showInfoPopover = !this.showInfoPopover;
  }

  closeInfoPopover() {
    this.showInfoPopover = false;
  }

  private loadMockData() {
    // Simulating different prediction types for team reference
    const useBinaryExample = false; // Set to false to always show multiple options

    if (useBinaryExample) {
      // Example 1: Binary prediction (Yes/No)
      this.predictionData = {
        type: 'binary',
        options: [
          {
            id: 'yes',
            name: 'SÍ',
            fierceIntuition: 73,
            marketPrice: 58,
            volume: '$226K'
          },
          {
            id: 'no',
            name: 'NO',
            fierceIntuition: 27,
            marketPrice: 42,
            volume: '$226K'
          }
        ]
      };
    } else {
      // Example 2: Multiple options prediction
      this.predictionData = {
        type: 'multiple',
        options: [
          {
            id: 'camila',
            name: 'Camila',
            fierceIntuition: 78,
            marketPrice: 45,
            volume: '$120K'
          },
          {
            id: 'andres',
            name: 'Andrés',
            fierceIntuition: 56,
            marketPrice: 30,
            volume: '$80K'
          },
          {
            id: 'alexandra',
            name: 'Alexandra',
            fierceIntuition: 42,
            marketPrice: 15,
            volume: '$45K'
          },
          {
            id: 'samuel',
            name: 'Samuel',
            fierceIntuition: 23,
            marketPrice: 10,
            volume: '$20K'
          }
        ]
      };
    }
  }

  getGap(option: MarketOption): number {
    return option.fierceIntuition - option.marketPrice;
  }

  getBarWidth(value: number): string {
    return `${value}%`;
  }

  Math = Math; // Expose Math to template
}
