import { Injectable } from '@angular/core';
import { ApiServices } from '../services/api.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SidebarMenuService {

    constructor(private apiService: ApiServices) { }

    public getUserProfile(): Observable<any> {
        return this.apiService.apiCall('/user/get-user-profile', 'GET', {});
    }

}