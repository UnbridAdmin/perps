import { Injectable } from '@angular/core';
import { ApiServices } from '../../services/api.service';

interface BuyVoteParams {
  prediction_option_multiple_id: number;
  side: string;
  amount_usd: number;
  message?: string;
  signature?: string;
  coin_id?: number;
  referral_code?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TradingPanelService {

  constructor(private apiService: ApiServices) { }

  public buyVote(params: BuyVoteParams) {
    return this.apiService.apiCall('trader/buy-vote', 'POST', params);
  }

}
