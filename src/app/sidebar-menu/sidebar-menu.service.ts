import { Injectable } from '@angular/core';
import { ApiServices } from '../services/api.service';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SidebarMenuService {
    private balanceUpdatedSource = new Subject<void>();
    balanceUpdated$ = this.balanceUpdatedSource.asObservable();

    constructor(private apiService: ApiServices) { }

    public getUserProfile(): Observable<any> {
        return this.apiService.apiCall('user/get-user-profile', 'GET', {});
    }

    public notifyBalanceUpdate(): void {
        this.balanceUpdatedSource.next();
    }

}