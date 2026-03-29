import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProfileInfoService } from '../../profile-info/profile-info.service';
import { AuthorizationService } from '../../../services/authorization.service';
import { WalletConnectService } from '../../../services/walletconnect.service';
import { UserProfileResponse } from '../../../shared/models/user-profile.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditProfileModalComponent } from '../../edit-profile-modal/edit-profile-modal.component';

@Component({
  selector: 'app-rwa-profile-info',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './rwa-profile-info.component.html',
  styleUrl: './rwa-profile-info.component.scss'
})
export class RwaProfileInfoComponent implements OnInit {

  public userProfile: UserProfileResponse | null = null;
  public isLoading: boolean = true;
  public errorMessage: string | null = null;
  public isOwnProfile: boolean = false;
  @Output() userIdLoaded = new EventEmitter<number>();

  constructor(
    private profileService: ProfileInfoService,
    private authService: AuthorizationService,
    private walletService: WalletConnectService,
    private route: ActivatedRoute,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.isLoading = true;
    // Check both path parameters (/leocruz) and query parameters (?username=leocruz)
    const usernameFromUrl = this.route.snapshot.paramMap.get('username') ||
      this.route.snapshot.queryParamMap.get('username');

    if (usernameFromUrl) {
      // If a username is specified in URL, check if it's the authenticated user's profile
      const authenticatedUsername = this.authService.getAuthenticatedUsername();
      
      if (this.authService.isAuthenticated() && authenticatedUsername === usernameFromUrl) {
        // Viewing own profile - use private service
        this.profileService.getUserProfile().subscribe({
          next: (profile) => {
            this.userProfile = profile;
            this.isOwnProfile = true;
            this.isLoading = false;
            this.userIdLoaded.emit(profile.user_id);
            console.log('RWA Profile loaded (own):', profile);
          },
          error: (err) => {
            this.errorMessage = 'Failed to load profile';
            this.isLoading = false;
            console.error('Error loading profile:', err);
          }
        });
      } else {
        // Viewing someone else's profile - use public service
        this.profileService.getUserPublicProfile(usernameFromUrl).subscribe({
          next: (profile) => {
            this.userProfile = profile;
            this.isOwnProfile = false;
            this.isLoading = false;
            this.userIdLoaded.emit(profile.user_id);
            console.log('RWA Profile loaded (public):', profile);
          },
          error: (err) => {
            this.errorMessage = 'User not found';
            this.isLoading = false;
            console.error('Error loading public profile:', err);
          }
        });
      }
    } else {
      // No username provided, try to load authenticated user's profile
      if (this.authService.isAuthenticated()) {
        this.profileService.getUserProfile().subscribe({
          next: (profile) => {
            this.userProfile = profile;
            this.isOwnProfile = true;
            this.isLoading = false;
            this.userIdLoaded.emit(profile.user_id);
            console.log('RWA Profile loaded (authenticated):', profile);
          },
          error: (err) => {
            this.errorMessage = 'Failed to load profile';
            this.isLoading = false;
            console.error('Error loading profile:', err);
          }
        });
      } else {
        this.errorMessage = 'Not authenticated';
        this.isLoading = false;
      }
    }
  }

  openEditProfileModal(): void {
    const modalRef = this.modalService.open(EditProfileModalComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });
  }
}
