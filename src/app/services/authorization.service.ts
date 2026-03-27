import { EventEmitter, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { ApiServices } from "./api.service";
import moment from "moment";
import { LoginModel } from "../shared/models/login.model";

@Injectable()
export class AuthorizationService {
    logoutEvent: EventEmitter<any> = new EventEmitter();
    constructor(private apiService: ApiServices,
        private router: Router) {
        this.checkExpiredSession();
        this.scheduleRefresh();
    }

    public ping() {
        return this.apiService.pingApiCall('user/ping', 'GET', '');
    }

    public login(data: LoginModel) {
        return this.apiService.publicApiCall('user/sign-in', 'POST', data);
    }

    public logout() {
        return this.apiService.apiCall('user/logout', 'GET', '');
    }

    public refreshToken() {
        return this.apiService.apiCall('user/refresh-cookie', 'GET', '');
    }

    public scheduleRefresh() {
        const expirationDateString = localStorage.getItem('expirationDate');
        if (expirationDateString) {
            const expirationDate = moment(expirationDateString, 'ddd MMM DD HH:mm:ss Z YYYY');
            if (expirationDate.isValid()) {
                const refreshDate = expirationDate.clone().subtract(5, 'minutes');
                const currentDate = moment();
                const timeUntilRefresh = refreshDate.diff(currentDate);
                if (currentDate.isBefore(expirationDate)) {
                    if (timeUntilRefresh > 0) {
                        setTimeout(() => {
                            this.refreshToken().subscribe({
                                next: (resp: any) => {
                                    localStorage.setItem('expirationDate', (resp as any).data[0].expires);
                                    this.scheduleRefresh(); // Programar la próxima actualización
                                },
                                error: (error: any) => {
                                    this.clearSession();
                                }
                            });
                        }, timeUntilRefresh);
                    } else {
                        this.clearSession();
                    }
                } else {
                    this.clearSession();
                }
            }
        }
    }

    public checkExpiredSession(): boolean {
        const expirationDateString = localStorage.getItem('expirationDate');
        if (expirationDateString) {
            const expirationDate = moment(expirationDateString, 'ddd MMM DD HH:mm:ss Z YYYY');
            if (expirationDate.isValid() && moment().isAfter(expirationDate)) {
                this.clearSession();
                return true;
            }
        }
        return false;
    }

    public clearSession(): void {
        const keysToRemove = ['expirationDate', 'signatureData', 'accountAddress', 'sessionAddress', 'username', 'user_id'];
        keysToRemove.forEach(key => localStorage.removeItem(key));

        sessionStorage.removeItem('accountAddress');
        sessionStorage.clear();

        this.logout().subscribe({
            next: () => console.log('✅ Session cleared'),
            error: () => console.log('⚠️ Session already invalid')
        });

        if (!this.router.url.includes('/login') && this.router.url !== '/') {
            this.router.navigate(['/']);
        }
    }

    public setSession(expires: string, address: string): void {
        localStorage.setItem('expirationDate', expires);
        localStorage.setItem('sessionAddress', address.toLowerCase());
        this.scheduleRefresh();
    }

    public existUser(data) {
        return this.apiService.publicApiCall('/user/exist-user', 'GET', data);
    }

    public isAuthenticated(): boolean {
        const expirationDateString = localStorage.getItem('expirationDate');
        if (!expirationDateString) return false;

        const sessionAddress = localStorage.getItem('sessionAddress');
        const currentAddress = sessionStorage.getItem('accountAddress');

        if (sessionAddress && currentAddress && sessionAddress.toLowerCase() !== currentAddress.toLowerCase()) {
            return false;
        }

        const expirationDate = moment(expirationDateString, 'ddd MMM DD HH:mm:ss Z YYYY');
        const currentDate = moment();
        return currentDate.isBefore(expirationDate);
    }

    public getAuthenticatedUsername(): string | null {
        if (!this.isAuthenticated()) {
            return null;
        }
        // Try to get username from localStorage first
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            return storedUsername;
        }
        // Fallback: generate username from wallet address
        const sessionAddress = localStorage.getItem('sessionAddress');
        if (sessionAddress) {
            return sessionAddress.slice(0, 10);
        }
        return null;
    }

    public setAuthenticatedUsername(username: string): void {
        localStorage.setItem('username', username);
    }
}
