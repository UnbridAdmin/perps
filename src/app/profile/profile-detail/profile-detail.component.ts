import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileInfoComponent } from '../profile-info/profile-info.component';
import { UserMetricsComponent } from '../user-metrics/user-metrics.component';
import { UserTabsComponent } from '../user-tabs/user-tabs.component';

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [
    CommonModule,
    ProfileInfoComponent,
    UserMetricsComponent,
    UserTabsComponent
  ],
  templateUrl: './profile-detail.component.html',
  styleUrl: './profile-detail.component.scss'
})
export class ProfileDetailComponent {

}
