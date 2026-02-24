import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accuracy-metrics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accuracy-metrics.component.html',
  styleUrl: './accuracy-metrics.component.scss'
})
export class AccuracyMetricsComponent {
  accuracyData = [
    { category: 'Sports', hits: 45, total: 48, percentage: 93.7 },
    { category: 'Politics', hits: 32, total: 35, percentage: 91.4 },
    { category: 'Crypto', hits: 28, total: 29, percentage: 96.5 },
    { category: 'Tech', hits: 15, total: 16, percentage: 93.8 }
  ];
}
