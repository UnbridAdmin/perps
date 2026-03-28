import { Injectable } from '@angular/core';
import { ApiServices } from '../../../../../services/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TradingHistoryService {
  constructor(private api: ApiServices) { }

  getUserMarketHistory(page: number, pageSize: number, startDate?: number, endDate?: number): Observable<any> {
    const data = {
      page: page,
      pageSize: pageSize,
      startDate: startDate,
      endDate: endDate
    };
    return this.api.apiCall('trader/get-user-market-history', 'POST', data);
  }
}
