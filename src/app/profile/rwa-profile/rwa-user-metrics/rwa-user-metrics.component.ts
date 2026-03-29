import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rwa-user-metrics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rwa-user-metrics.component.html',
  styleUrl: './rwa-user-metrics.component.scss'
})
export class RwaUserMetricsComponent {
  activeTab: string | null = null;

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
