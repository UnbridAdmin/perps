import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signal-metrics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signal-metrics.component.html',
  styleUrl: './signal-metrics.component.scss'
})
export class SignalMetricsComponent {
  signalsData = [
    { category: 'Sports', count: 5, rating: 4.8 },
    { category: 'Politics', count: 3, rating: 4.2 },
    { category: 'Crypto', count: 2, rating: 4.5 },
    { category: 'Tech', count: 2, rating: 4.0 }
  ];

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }
}
