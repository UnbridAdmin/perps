import { Injectable } from '@angular/core';
import { ApiServices } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class TopBurnersService {

  constructor(private apiService: ApiServices) { }

  public getTopBurners(page: number, limit: number) {
    const params = { page, limit };
    return this.apiService.publicApiCall('fierce/get-top-burners', 'GET', params);
  }
}
