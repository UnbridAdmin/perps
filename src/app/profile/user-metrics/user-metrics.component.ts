import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccuracyMetricsComponent } from '../accuracy-metrics/accuracy-metrics.component';
import { SignalMetricsComponent } from '../signal-metrics/signal-metrics.component';
import { EarningsMetricsComponent } from '../earnings-metrics/earnings-metrics.component';

@Component({
  selector: 'app-user-metrics',
  standalone: true,
  imports: [
    CommonModule,
    AccuracyMetricsComponent,
    SignalMetricsComponent,
    EarningsMetricsComponent
  ],
  templateUrl: './user-metrics.component.html',
  styleUrl: './user-metrics.component.scss'
})
export class UserMetricsComponent {
  activeTab: string | null = null;

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}

