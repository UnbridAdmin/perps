import { Injectable } from '@angular/core';
import { ApiServices } from '../../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class FollowerListService {
  constructor(private apiService: ApiServices) {}

  public getFollowers(username: string, page: number) {
    const params = { username, page };
    return this.apiService.apiCall('user/followers', 'GET', params);
  }

  public getVerifiedFollowers(username: string, page: number) {
    const params = { username, page };
    return this.apiService.apiCall('user/verified-followers', 'GET', params);
  }

  public getFollowings(username: string, page: number) {
    const params = { username, page };
    return this.apiService.apiCall('user/followings', 'GET', params);
  }
}
