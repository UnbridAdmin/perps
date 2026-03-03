import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserProfileResponse } from '../../shared/models/user-profile.model';

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

  constructor(public activeModal: NgbActiveModal) { }

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
    // In a real scenario, we would call a service here
    // For now we just return the edited profile to the caller
    this.activeModal.close(this.editedProfile);
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
