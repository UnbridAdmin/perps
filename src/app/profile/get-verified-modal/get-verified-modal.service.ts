import { Injectable } from '@angular/core';
import { ApiServices } from '../../services/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GetVerifiedModalService {

  constructor(private apiService: ApiServices) { }

  /**
   * Request user verification
   */
  public getVerified(): Observable<any> {
    return this.apiService.apiCall('user/get-verified', 'POST', {});
  }
}
