import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RwaProfileInfoComponent } from '../rwa-profile-info/rwa-profile-info.component';
import { RwaUserMetricsComponent } from '../rwa-user-metrics/rwa-user-metrics.component';
import { RwaUserTabsComponent } from '../rwa-user-tabs/rwa-user-tabs.component';

@Component({
  selector: 'app-rwa-profile-detail',
  standalone: true,
  imports: [
    CommonModule,
    RwaProfileInfoComponent,
    RwaUserMetricsComponent,
    RwaUserTabsComponent
  ],
  templateUrl: './rwa-profile-detail.component.html',
  styleUrl: './rwa-profile-detail.component.scss'
})
export class RwaProfileDetailComponent {
  profileUserId?: number;

  onUserIdLoaded(userId: number): void {
    console.log('RwaProfileDetail: Received userId:', userId);
    this.profileUserId = userId;
  }
}
