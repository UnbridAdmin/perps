import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UserProfileResponse } from '../../shared/models/user-profile.model';
import { ProfileInfoService } from '../profile-info/profile-info.service';
import { FollowerListService } from './follower-list.service';

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

  // Real data from service
  followers: any[] = [];
  currentPage = 1;
  hasMore = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profileService: ProfileInfoService,
    private followerService: FollowerListService
  ) { }

  ngOnInit(): void {
    // ✅ SOLUCION: Usar combineLatest para esperar ambos parametros antes de cargar datos
    // Esto evita el RACE CONDITION donde se cargaban dos veces la lista
    this.route.params.subscribe(params => {
      this.username = params['username'];
      if (this.username) {
        this.loadUserProfile(this.username);
      }
    });

    this.route.queryParams.subscribe(params => {
      const newTab = params['tab'] || 'followers';

      // ✅ SOLO CARGAR SI EL TAB REALMENTE CAMBIO y tenemos username
      if (this.activeTab !== newTab && this.username) {
        this.activeTab = newTab;
        this.loadInitialData();
      }
    });
  }

  loadUserProfile(username: string): void {
    this.profileService.getUserPublicProfile(username).subscribe({
      next: (resp: any) => {
        if (resp.data && resp.data.length > 0) {
          this.userProfile = resp.data[0];
        }
      },
      error: (err) => console.error('Error loading profile', err)
    });
  }

  loadInitialData(): void {
    this.followers = [];
    this.currentPage = 1;
    this.hasMore = true;
    this.loadData();
  }

  loadData(): void {
    if (!this.username) return;
    this.isLoading = true;

    let request;
    if (this.activeTab === 'followers') {
      request = this.followerService.getFollowers(this.username, this.currentPage);
    } else if (this.activeTab === 'verified') {
      request = this.followerService.getVerifiedFollowers(this.username, this.currentPage);
    } else {
      request = this.followerService.getFollowings(this.username, this.currentPage);
    }

    request.subscribe({
      next: (resp: any) => {
        if (resp.data) {
          const mappedData = resp.data.map((u: any) => ({
            id: u.user_id,
            username: u.user_username,
            display_name: u.user_username, // Using username as display name
            bio: u.description || '',
            // ✅ Avatar random generado automaticamente si viene null
            avatar_url: u.url_avatar && u.url_avatar !== 'null' && u.url_avatar !== ''
              ? u.url_avatar
              : `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${u.user_id}`,
            is_following: u.is_following,
            follows_you: u.follows_you,
            is_verified: u.is_verified === 'YES'
          }));

          this.followers = [...this.followers, ...mappedData];
          this.hasMore = resp.data.length === 100;
        } else {
          this.hasMore = false;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading followers list', err);
        this.isLoading = false;
      }
    });
  }

  loadMore(): void {
    if (this.hasMore && !this.isLoading) {
      this.currentPage++;
      this.loadData();
    }
  }

  setActiveTab(tab: 'verified' | 'followers' | 'following'): void {
    // ✅ PREVENIR LLAMADAS DUPLICADAS: Si ya estamos en este tab no hacer nada
    if (this.activeTab === tab) return;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  goBack(): void {
    window.history.back();
  }

  toggleFollow(user: any): void {
    // ✅ Optimistic UI Update inmediato antes de llamar al API
    const previousState = user.is_following;
    user.is_following = !previousState;

    // ✅ Llamar al servicio backend
    this.followerService.followUser(user.id).subscribe({
      next: () => {
        // Todo ok, dejamos el estado como esta
        console.log(`✅ ${user.is_following ? 'Seguido' : 'Dejado de seguir'} usuario ${user.username}`);
      },
      error: (err) => {
        // ❌ Si falla la peticion volvemos al estado anterior
        user.is_following = previousState;
        console.error('❌ Error al seguir usuario', err);
      }
    });
  }
}
