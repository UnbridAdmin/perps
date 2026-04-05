import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiServices } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class PriceTokenService {
  constructor(private apiService: ApiServices) { }

  getTokenPrice(): Observable<any> {
    return this.apiService.apiCall('/fierce/token-price', 'GET', {});
  }
}
