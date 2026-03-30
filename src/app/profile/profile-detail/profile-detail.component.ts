import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileInfoComponent } from '../profile-info/profile-info.component';
import { UserMetricsComponent } from '../user-metrics/user-metrics.component';
import { UserTabsComponent } from '../user-tabs/user-tabs.component';
import { RwaProfileInfoComponent } from '../rwa-profile/rwa-profile-info/rwa-profile-info.component';
import { RwaUserMetricsComponent } from '../rwa-profile/rwa-user-metrics/rwa-user-metrics.component';
import { RwaUserTabsComponent } from '../rwa-profile/rwa-user-tabs/rwa-user-tabs.component';

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [
    CommonModule,
    ProfileInfoComponent,
    UserMetricsComponent,
    UserTabsComponent,
    RwaProfileInfoComponent,
    RwaUserMetricsComponent,
    RwaUserTabsComponent
  ],
  templateUrl: './profile-detail.component.html',
  styleUrl: './profile-detail.component.scss'
})
export class ProfileDetailComponent {
  profileUserId?: number;
  profileType: 'USER' | 'RWA' = 'USER';

  onUserIdLoaded(userId: number): void {
    console.log('ProfileDetail: Received userId:', userId);
    this.profileUserId = userId;
  }

  onProfileTypeDetected(type: 'USER' | 'RWA'): void {
    console.log('ProfileDetail: Profile type detected:', type);
    this.profileType = type;
  }
}
