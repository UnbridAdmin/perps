import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProfileInfoService } from './profile-info.service';
import { AuthorizationService } from '../../services/authorization.service';
import { WalletConnectService } from '../../services/walletconnect.service';
import { UserProfileResponse } from '../../shared/models/user-profile.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditProfileModalComponent } from '../edit-profile-modal/edit-profile-modal.component';
import { ApiServices } from '../../services/api.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { firstValueFrom, Subscription, combineLatest } from 'rxjs';
import { GetVerifiedModalComponent } from '../get-verified-modal/get-verified-modal.component';

@Component({
  selector: 'app-profile-info',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-info.component.html',
  styleUrl: './profile-info.component.scss'
})
export class ProfileInfoComponent implements OnInit, OnDestroy {

  public userProfile: UserProfileResponse | null = null;
  public isLoading: boolean = true;
  public isFollowingLoading: boolean = false;
  public errorMessage: string | null = null;
  public isOwnProfile: boolean = false;
  @Output() userIdLoaded = new EventEmitter<number>();
  @Output() profileTypeDetected = new EventEmitter<'USER' | 'RWA'>();
  private routeSubscription?: Subscription;

  constructor(
    private profileService: ProfileInfoService,
    private authService: AuthorizationService,
    private walletService: WalletConnectService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private apiService: ApiServices,
    private confirmDialogService: ConfirmDialogService
  ) { }

  ngOnInit(): void {
    this.routeSubscription = combineLatest([
      this.route.paramMap,
      this.route.queryParamMap
    ]).subscribe(() => {
      this.loadProfile();
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  private loadProfile(): void {
    this.isLoading = true;
    this.userProfile = null;
    this.errorMessage = null;
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
              const profileType = this.userProfile.type_profile || 'USER';
              this.profileTypeDetected.emit(profileType);
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
              const profileType = this.userProfile.type_profile || 'USER';
              this.profileTypeDetected.emit(profileType);
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
            const profileType = this.userProfile.type_profile || 'USER';
            this.profileTypeDetected.emit(profileType);
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

  public openGetVerifiedModal(): void {
    if (!this.userProfile) return;

    const modalRef = this.modalService.open(GetVerifiedModalComponent, {
      centered: true,
      backdrop: 'static',
      windowClass: 'get-verified-modal-window'
    });

    modalRef.componentInstance.userProfile = this.userProfile;

    modalRef.result.then((result) => {
      if (result) {
        // Verification success — update profile status locally or reload
        this.loadProfile();
      }
    }, (reason) => {
      // Dismissed
    });
  }

  public async followUser(): Promise<void> {
    if (!this.userProfile || this.isOwnProfile || this.isFollowingLoading) return;

    this.isFollowingLoading = true;

    try {
      // 1. Check if user is authenticated
      if (!this.authService.isAuthenticated()) {
        const isConnected = await this.walletService.checkConnection();
        if (!isConnected) {
          this.isFollowingLoading = false;
          this.confirmDialogService.showInfo({
            title: 'Billetera requerida',
            message1: 'Por favor, conecta tu billetera para poder seguir a otros usuarios.'
          });
          return;
        }

        const walletAddress = await this.walletService.getConnectedWalletAddress();

        try {
          const existResponse = await firstValueFrom(this.authService.existUser({ address: walletAddress })) as any;
          if (existResponse?.data?.exists) {
            this.isFollowingLoading = false;
            // User exists in DB but not authenticated - show login required
            this.confirmDialogService.showInfo({
              title: 'Inicio de sesión requerido',
              message1: 'Debes iniciar sesión para poder realizar esta acción.'
            });
            return;
          }
        } catch (error) {
          console.error('Error checking if user exists:', error);
        }

        // Generate message to sign
        const message = `Click to sign in and accept the Unbrid Terms of Service(https://unbrid.com/privacy-policy). Login with secure code: ${Date.now()}`;

        // Request signature
        const signatureData = await this.walletService.signMessage(message);

        // Create user request payload
        const createUserRequest = {
          address: walletAddress,
          coin_id: 1,
          message: signatureData.message,
          signature: signatureData.signature,
          referral_code: 'syyPTsvh70245910'
        };

        // Call secure-create-user endpoint
        const createUserResponse = await firstValueFrom(
          this.apiService.publicApiCall('user/secure-create-user', 'POST', createUserRequest)
        ) as any;

        if (createUserResponse?.success || createUserResponse?.message === 'SUCCESS') {
          if (createUserResponse?.data && createUserResponse.data.length > 0) {
            this.authService.setSession(createUserResponse.data[0].expires, walletAddress);
          }
        } else {
          throw new Error('Failed to authenticate');
        }
      }

      // 2. Proceed with follow action
      this.profileService.followUser(this.userProfile.user_id).subscribe({
        next: (resp: any) => {
          this.isFollowingLoading = false;
          if (this.userProfile) {
            this.userProfile.followers++; // Optimistic update
          }
          this.confirmDialogService.showSuccess({
            title: '¡Siguiendo!',
            message1: `Ahora sigues a ${this.userProfile?.username}.`
          });
        },
        error: (err) => {
          this.isFollowingLoading = false;
          console.error('Error following user:', err);
          this.confirmDialogService.showError({
            title: 'Error',
            message1: err.error?.message || 'No se pudo completar la acción de seguir.'
          });
        }
      });

    } catch (error) {
      this.isFollowingLoading = false;
      console.error('Authentication/Follow error:', error);
      this.confirmDialogService.showError({
        title: 'Error',
        message1: 'Hubo un problema al procesar tu solicitud. Por favor intenta de nuevo.'
      });
    }
  }

}
