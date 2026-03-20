import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileDetailComponent } from './profile-detail/profile-detail.component';
import { FollowerListComponent } from './follower-list/follower-list.component';

const routes: Routes = [
  { path: '', component: ProfileDetailComponent },
  { path: 'followers/:username', component: FollowerListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
