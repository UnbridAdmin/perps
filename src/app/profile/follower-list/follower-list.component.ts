import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UserProfileResponse } from '../../shared/models/user-profile.model';
import { ProfileInfoService } from '../profile-info/profile-info.service';

interface FollowerUser {
  id: number;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  is_following: boolean;
  follows_you: boolean;
  is_verified?: boolean;
}

@Component({
  selector: 'app-follower-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './follower-list.component.html',
  styleUrls: ['./follower-list.component.scss']
})
export class FollowerListComponent implements OnInit {
  activeTab: 'verified' | 'followers' | 'following' = 'followers';
  userProfile: any | null = null;
  isLoading = true;
  username: string | null = null;

  // Mock data for demonstration
  followers: FollowerUser[] = [
    {
      id: 1,
      username: 'Star76181457405',
      display_name: 'Dorothea',
      bio: "I'm not lazy, just on energy-saving mode.",
      avatar_url: 'https://picsum.photos/200/200?random=1',
      is_following: false,
      follows_you: true
    },
    {
      id: 2,
      username: 'HeroeFujie',
      display_name: 'HeroeFujie $XAGE _ Building on @ZugChain 🚀',
      bio: 'Members : @xyberinc Building on @ZugChain 🚀',
      avatar_url: 'https://picsum.photos/200/200?random=2',
      is_following: false,
      follows_you: true
    },
    {
      id: 3,
      username: 'TriSumika',
      display_name: 'TRI SUMIKA',
      bio: 'Illustrator | Degenooooor',
      avatar_url: 'https://picsum.photos/200/200?random=3',
      is_following: false,
      follows_you: true
    },
    {
      id: 4,
      username: 'kumurusut',
      display_name: 'kumurusut',
      bio: '',
      avatar_url: 'https://picsum.photos/200/200?random=4',
      is_following: false,
      follows_you: true
    },
    {
      id: 5,
      username: 'Zen0x90',
      display_name: 'Zen 💧',
      bio: 'Tensorian #1285 🚀 Analyst | Degen | Collab Director | AMA hoster | 1.3 Mil+ Network | Caller #Nft / #Crypto Advisor 💧 @underground caller',
      avatar_url: 'https://picsum.photos/200/200?random=5',
      is_following: false,
      follows_you: true,
      is_verified: true
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profileService: ProfileInfoService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.username = params['username'];
      if (this.username) {
        this.loadUserProfile(this.username);
      }
    });

    // Also check for initial tab state from query params if needed
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
    });
  }

  loadUserProfile(username: string): void {
    this.isLoading = true;
    this.profileService.getUserPublicProfile(username).subscribe({
      next: (resp: any) => {
        if (resp.data && resp.data.length > 0) {
          this.userProfile = resp.data[0];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading profile', err);
        this.isLoading = false;
      }
    });
  }

  setActiveTab(tab: 'verified' | 'followers' | 'following'): void {
    this.activeTab = tab;
    // Update URL query params without navigation
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge'
    });
  }

  goBack(): void {
    window.history.back();
  }

  toggleFollow(user: FollowerUser): void {
    user.is_following = !user.is_following;
    // In a real app, this would call a service
  }
}
