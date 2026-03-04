import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserProfileResponse } from '../../shared/models/user-profile.model';
import { EditProfileModalService } from './edit-profile-modal.service';

@Component({
  selector: 'app-edit-profile-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-profile-modal.component.html',
  styleUrl: './edit-profile-modal.component.scss'
})
export class EditProfileModalComponent implements OnInit {
  @Input() userProfile!: UserProfileResponse;

  public editedProfile: any = {};
  public showBannerPanel: boolean = false;
  public showAvatarPanel: boolean = false;

  public bannerUrlInput: string = '';
  public avatarUrlInput: string = '';

  public bannerStatus: string = '';
  public avatarStatus: string = '';

  public bannerStatusClass: string = '';
  public avatarStatusClass: string = '';

  public errorMessage: string = '';
  public isLoading: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private editProfileService: EditProfileModalService
  ) { }

  ngOnInit(): void {
    if (this.userProfile) {
      this.editedProfile = {
        username: this.userProfile.username || '',
        description: this.userProfile.description || '',
        url_banner: this.userProfile.url_banner || '',
        url_avatar: this.userProfile.url_avatar || ''
      };
      this.bannerUrlInput = this.editedProfile.url_banner;
      this.avatarUrlInput = this.editedProfile.url_avatar;
    }
  }

  toggleBannerPanel() {
    this.showBannerPanel = !this.showBannerPanel;
    if (this.showBannerPanel) this.showAvatarPanel = false;
  }

  closeBannerPanel() {
    this.showBannerPanel = false;
  }

  toggleAvatarPanel() {
    this.showAvatarPanel = !this.showAvatarPanel;
    if (this.showAvatarPanel) this.showBannerPanel = false;
  }

  closeAvatarPanel() {
    this.showAvatarPanel = false;
  }

  applyBannerUrl() {
    if (!this.bannerUrlInput) {
      this.bannerStatus = '⚠ Please enter a URL';
      this.bannerStatusClass = 'err';
      return;
    }
    this.bannerStatus = '⏳ Loading preview...';
    this.bannerStatusClass = 'loading';

    this.tryLoadImage(this.bannerUrlInput, (success) => {
      if (success) {
        this.editedProfile.url_banner = this.bannerUrlInput;
        this.bannerStatus = '✓ Image loaded correctly';
        this.bannerStatusClass = 'ok';
        setTimeout(() => this.closeBannerPanel(), 500);
      } else {
        this.bannerStatus = '⚠ Could not load image. Check URL or CORS';
        this.bannerStatusClass = 'err';
      }
    });
  }

  applyAvatarUrl() {
    if (!this.avatarUrlInput) {
      this.avatarStatus = '⚠ Please enter a URL';
      this.avatarStatusClass = 'err';
      return;
    }
    this.avatarStatus = '⏳ Loading preview...';
    this.avatarStatusClass = 'loading';

    this.tryLoadImage(this.avatarUrlInput, (success) => {
      if (success) {
        this.editedProfile.url_avatar = this.avatarUrlInput;
        this.avatarStatus = '✓ Image loaded correctly';
        this.avatarStatusClass = 'ok';
        setTimeout(() => this.closeAvatarPanel(), 500);
      } else {
        this.avatarStatus = '⚠ Could not load image. Check URL or CORS';
        this.avatarStatusClass = 'err';
      }
    });
  }

  private tryLoadImage(url: string, callback: (success: boolean) => void) {
    const img = new Image();
    img.onload = () => callback(true);
    img.onerror = () => callback(false);
    img.src = url;
  }

  saveProfile() {
    this.errorMessage = '';
    const rawUsername = this.editedProfile.username || '';

    if (!rawUsername.trim()) {
      this.errorMessage = 'El nombre de usuario es requerido.';
      return;
    }

    if (rawUsername.includes(' ')) {
      this.errorMessage = 'El nombre de usuario no puede contener espacios.';
      return;
    }

    if (rawUsername.length < 5 || rawUsername.length > 20) {
      this.errorMessage = 'El nombre de usuario debe tener entre 5 y 20 caracteres.';
      return;
    }

    const validCharsRegex = /^[a-zA-Z0-9_]+$/;
    if (!validCharsRegex.test(rawUsername)) {
      this.errorMessage = 'El nombre de usuario solo puede contener letras (sin acentos), números y guiones bajos.';
      return;
    }

    this.isLoading = true;

    this.editProfileService.updateProfile(this.editedProfile).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.activeModal.close(this.editedProfile);
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err?.error?.message || '';
        if (msg === 'USER_EXISTS' || msg.includes('409') || msg === 'USERNAME_EXISTS') {
          this.errorMessage = 'Este nombre de usuario ya está en uso.';
        } else if (msg === 'USERNAME_LENGTH') {
          this.errorMessage = 'El nombre de usuario debe tener entre 5 y 20 caracteres.';
        } else if (msg === 'USERNAME_INVALID_CHARS') {
          this.errorMessage = 'El nombre de usuario solo puede contener letras, números y guiones bajos.';
        } else if (msg) {
          this.errorMessage = 'Error: ' + msg;
        } else {
          this.errorMessage = 'Ocurrió un error al actualizar el perfil.';
        }
        console.error('Error actualizando perfil:', err);
      }
    });
  }

  onImgError(event: any) {
    event.target.style.display = 'none';
  }

  onImgLoad(event: any) {
    event.target.style.display = 'block';
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name.substring(0, 2).toUpperCase();
  }
}
