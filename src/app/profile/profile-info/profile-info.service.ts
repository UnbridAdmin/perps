import { Injectable } from '@angular/core';
import { ApiServices } from '../../services/api.service';
import { UserProfileResponse } from '../../shared/models/user-profile.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProfileInfoService {

    constructor(private apiService: ApiServices) { }

    public getUserProfile(): Observable<any> {
        return this.apiService.apiCall('user/get-user-profile', 'GET', {});
    }

    public getUserPublicProfile(username: string): Observable<any> {
        return this.apiService.publicApiCall('user/get-user-public-profile', 'GET', { username });
    }

}
