import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.scss',
})
export class GraphComponent {
  @Input() percentage: number = 0;
  @Input() change: number = 0;

  get changeText(): string {
    if (this.change === 0) return `Alta probabilidad de ocurrencia (${this.percentage}%)`;
    const direction = this.change > 0 ? 'subido' : 'bajado';
    return `La probabilidad ha ${direction} ${Math.abs(this.change)}% en las últimas 24h`;
  }

  get icon(): string {
    return this.change >= 0 ? '📈' : '📉';
  }
}
