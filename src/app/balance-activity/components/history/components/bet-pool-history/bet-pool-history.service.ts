import { Injectable } from '@angular/core';
import { ApiServices } from '../../../../../services/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BetPoolHistoryService {
  constructor(private api: ApiServices) {}

  getUserBetHistory(page: number, pageSize: number, startDate?: number, endDate?: number): Observable<any> {
    const data = {
      page: page,
      pageSize: pageSize,
      startDate: startDate,
      endDate: endDate
    };
    return this.api.apiCall('predictions/get-user-bet-history', 'POST', data);
  }
}
