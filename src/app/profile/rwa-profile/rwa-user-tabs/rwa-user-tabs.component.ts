import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostPredictionComponent } from '../../../shared/post-prediction/post-prediction.component';
import { RwaAssetsComponent } from './rwa-assets/rwa-assets.component';
import { RwaMinidexComponent } from './rwa-minidex/rwa-minidex.component';
import { RwaReportsComponent } from './rwa-reports/rwa-reports.component';

@Component({
  selector: 'app-rwa-user-tabs',
  standalone: true,
  imports: [
    CommonModule,
    PostPredictionComponent,
    RwaAssetsComponent,
    RwaMinidexComponent,
    RwaReportsComponent
  ],
  templateUrl: './rwa-user-tabs.component.html',
  styleUrl: './rwa-user-tabs.component.scss'
})
export class RwaUserTabsComponent {
  activeTab: string = 'my-predictions';
  @Input() userId?: number;

  constructor() {
    console.log('RwaUserTabs: Initial userId:', this.userId);
  }

  ngOnChanges() {
    console.log('RwaUserTabs: userId changed to:', this.userId);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
