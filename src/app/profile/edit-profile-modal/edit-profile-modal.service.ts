import { Injectable } from '@angular/core';
import { ApiServices } from '../../services/api.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EditProfileModalService {

    constructor(private apiService: ApiServices) { }

    public updateProfile(data: any): Observable<any> {
        return this.apiService.apiCall('/user/update-profile', 'POST', data);
    }
}
