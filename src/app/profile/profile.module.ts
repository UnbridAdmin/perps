import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileDetailComponent } from './profile-detail/profile-detail.component';
import { ProfileInfoComponent } from './profile-info/profile-info.component';
import { UserMetricsComponent } from './user-metrics/user-metrics.component';
import { FollowersMetricsComponent } from './followers-metrics/followers-metrics.component';
import { AccuracyMetricsComponent } from './accuracy-metrics/accuracy-metrics.component';
import { SignalMetricsComponent } from './signal-metrics/signal-metrics.component';
import { EarningsMetricsComponent } from './earnings-metrics/earnings-metrics.component';
import { UserTabsComponent } from './user-tabs/user-tabs.component';
import { EditProfileModalComponent } from './edit-profile-modal/edit-profile-modal.component';
import { FollowerListComponent } from './follower-list/follower-list.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    ProfileDetailComponent,
    ProfileInfoComponent,
    UserMetricsComponent,
    FollowersMetricsComponent,
    AccuracyMetricsComponent,
    SignalMetricsComponent,
    EarningsMetricsComponent,
    UserTabsComponent,
    EditProfileModalComponent,
    FollowerListComponent
  ]
})
export class ProfileModule { }
