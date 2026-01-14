import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FollowersMetricsComponent } from '../followers-metrics/followers-metrics.component';
import { AccuracyMetricsComponent } from '../accuracy-metrics/accuracy-metrics.component';
import { TotemsMetricsComponent } from '../totems-metrics/totems-metrics.component';
import { EarningsMetricsComponent } from '../earnings-metrics/earnings-metrics.component';

@Component({
  selector: 'app-user-metrics',
  standalone: true,
  imports: [
    CommonModule,
    FollowersMetricsComponent,
    AccuracyMetricsComponent,
    TotemsMetricsComponent,
    EarningsMetricsComponent
  ],
  templateUrl: './user-metrics.component.html',
  styleUrl: './user-metrics.component.scss'
})
export class UserMetricsComponent {
  activeTab: string = 'followers';

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
