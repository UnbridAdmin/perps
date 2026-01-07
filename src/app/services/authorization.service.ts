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
        this.scheduleRefresh();
    }

    public ping() {
        return this.apiService.pingApiCall('/user/ping', 'GET', '');
    }

    public login(data: LoginModel) {
        return this.apiService.publicApiCall('/user/sign-in', 'POST', data);
    }

    public logout() {
        return this.apiService.apiCall('/user/logout', 'GET', '');
    }

    public refreshToken() {
        return this.apiService.apiCall('/user/refresh-cookie', 'GET', '');
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
                                    this.router.navigate(['/']);
                                    sessionStorage.clear();
                                    localStorage.clear();
                                }
                            });
                        }, timeUntilRefresh);
                    } else {
                        this.router.navigate(['/']);
                        sessionStorage.clear();
                        localStorage.clear();
                    }
                } else {
                    this.router.navigate(['/']);
                    sessionStorage.clear();
                    localStorage.clear();
                }
            }
        }
    }

    public existUser(data) {
        return this.apiService.publicApiCall('/user/exist-user', 'GET', data);
    }
}