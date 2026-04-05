import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriceTokenService } from './price-token.service';
import { ApexOptions } from 'ng-apexcharts';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-price-token',
  standalone: true,
  imports: [CommonModule,SharedModule],
  templateUrl: './price-token.component.html',
  styleUrl: './price-token.component.scss'
})
export class PriceTokenComponent implements OnInit {
  tokenPrice: number = 0;
  priceChange: number = 0;
  history: any[] = [];
  
  chartOptions: ApexOptions = {};

  constructor(private priceTokenService: PriceTokenService) { }

  ngOnInit(): void {
    this.priceTokenService.getTokenPrice().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          this.tokenPrice = data.currentPrice;
          this.priceChange = data.priceChange30dPercentage;
          this.history = data.history || [];
          this.setupChart();
        }
      },
      error: (err) => {
        console.error('Error fetching token price:', err);
      }
    });
  }

  setupChart(): void {
    const chartColor = this.priceChange >= 0 ? '#10d07a' : '#f0436a';
    
    this.chartOptions = {
      series: [{
        data: this.history.map(h => h.price)
      }],
      chart: {
        type: 'area',
        height: 60,
        sparkline: {
          enabled: true
        },
        toolbar: {
          show: false
        },
        animations: {
          enabled: false
        }
      },
      stroke: {
        width: 2,
        curve: 'smooth',
        colors: [chartColor]
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.3,
          opacityTo: 0,
          stops: [0, 100],
          colorStops: [
            {
              offset: 0,
              color: chartColor,
              opacity: 0.3
            },
            {
              offset: 100,
              color: chartColor,
              opacity: 0
            }
          ]
        }
      },
      tooltip: {
        enabled: false
      },
      xaxis: {
        labels: {
          show: false
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          show: false
        }
      },
      grid: {
        show: false
      }
    };
  }
}
