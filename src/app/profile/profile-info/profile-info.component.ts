import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProfileInfoService } from './profile-info.service';
import { AuthorizationService } from '../../services/authorization.service';
import { WalletConnectService } from '../../services/walletconnect.service';
import { UserProfileResponse } from '../../shared/models/user-profile.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditProfileModalComponent } from '../edit-profile-modal/edit-profile-modal.component';

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
          next: (resp: any) => {
            if (resp.data && resp.data.length > 0) {
              this.userProfile = resp.data[0];
              this.userIdLoaded.emit(this.userProfile.user_id);
              this.isOwnProfile = true;
              // Save username and user_id to localStorage for future comparisons
              if (this.userProfile.username) {
                localStorage.setItem('username', this.userProfile.username);
              }
              if (this.userProfile.user_id) {
                localStorage.setItem('user_id', this.userProfile.user_id.toString());
              }
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
        // Viewing someone else's profile - use public service
        this.profileService.getUserPublicProfile(usernameFromUrl).subscribe({
          next: (resp: any) => {
            if (resp.data && resp.data.length > 0) {
              this.userProfile = resp.data[0];
              this.userIdLoaded.emit(this.userProfile.user_id);
              // Save username and user_id to localStorage for future comparisons
              if (this.userProfile.username) {
                localStorage.setItem('username', this.userProfile.username);
              }
              if (this.userProfile.user_id) {
                localStorage.setItem('user_id', this.userProfile.user_id.toString());
              }
              this.isOwnProfile = false;
            }
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error fetching public profile:', err);
            this.errorMessage = 'Could not load public profile.';
            this.isLoading = false;
          }
        });
      }
    } else if (this.authService.isAuthenticated()) {
      // If no username is specified but the user is logged in, show their own profile
      this.profileService.getUserProfile().subscribe({
        next: (resp: any) => {
          if (resp.data && resp.data.length > 0) {
            this.userProfile = resp.data[0];
            this.userIdLoaded.emit(this.userProfile.user_id);
            this.isOwnProfile = true;
            // Save username to localStorage for future comparisons
            if (this.userProfile.username) {
              localStorage.setItem('username', this.userProfile.username);
            }
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

  public openEditProfileModal(): void {
    console.log('Opening edit profile modal');
    if (!this.userProfile) return;

    const modalRef = this.modalService.open(EditProfileModalComponent, {
      centered: true,
      backdrop: 'static',
      windowClass: 'edit-profile-modal-window'
    });

    modalRef.componentInstance.userProfile = this.userProfile;

    modalRef.result.then((result) => {
      if (result) {
        console.log('Profile updated:', result);
        // Here we would call the update service and then reload
        this.userProfile = { ...this.userProfile, ...result };
      }
    }, (reason) => {
      // Dismissed
    });
  }

}
