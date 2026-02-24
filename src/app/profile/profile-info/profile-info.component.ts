import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProfileInfoService } from './profile-info.service';
import { AuthorizationService } from '../../services/authorization.service';
import { WalletConnectService } from '../../services/walletconnect.service';
import { UserProfileResponse } from '../../shared/models/user-profile.model';

@Component({
  selector: 'app-profile-info',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-info.component.html',
  styleUrl: './profile-info.component.scss'
})
export class ProfileInfoComponent implements OnInit {

  public userProfile: UserProfileResponse | null = null;
  public isLoading: boolean = true;
  public errorMessage: string | null = null;

  constructor(
    private profileService: ProfileInfoService,
    private authService: AuthorizationService,
    private walletService: WalletConnectService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.isLoading = true;
    // Check both path parameters (/leocruz) and query parameters (?username=leocruz)
    const username = this.route.snapshot.paramMap.get('username') ||
      this.route.snapshot.queryParamMap.get('username');

    if (username) {
      // If a username is specified, we fetch that public profile
      this.profileService.getUserPublicProfile(username).subscribe({
        next: (resp: any) => {
          if (resp.data && resp.data.length > 0) {
            this.userProfile = resp.data[0];
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching public profile:', err);
          this.errorMessage = 'Could not load public profile.';
          this.isLoading = false;
        }
      });
    } else if (this.authService.isAuthenticated()) {
      // If no username is specified but the user is logged in, show their own profile
      this.profileService.getUserProfile().subscribe({
        next: (resp: any) => {
          if (resp.data && resp.data.length > 0) {
            this.userProfile = resp.data[0];
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching auth profile:', err);
          this.errorMessage = 'Could not load profile.';
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
      this.errorMessage = 'No profile information available.';
    }
  }

}
