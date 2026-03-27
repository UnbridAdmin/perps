import { Injectable } from '@angular/core';
import { ApiServices } from '../../services/api.service';

interface GetPredictionsParams {
  page: number;
  limit: number;
  category?: number;
  user_id?: number;
}

interface CastIntuitionVoteParams {
  predictionId: number;
  optionId: number;
}

@Injectable({
  providedIn: 'root'
})
export class PostPredictionService {

  constructor(private apiService: ApiServices) { }

  public getAuthenticatedPredictions(params: GetPredictionsParams) {
    return this.apiService.apiCall('predictions/get-predictions', 'GET', params);
  }

  public getPublicPredictions(params: GetPredictionsParams) {
    return this.apiService.publicApiCall('predictions/get-public-predictions', 'GET', params);
  }

  public castIntuitionVote(params: CastIntuitionVoteParams) {
    return this.apiService.apiCall('predictions/cast-intuition-vote', 'POST', params);
  }

  public getTradingMarketData(predictionId: number) {
    return this.apiService.publicApiCall('predictions/get-trading-market-data-by-prediction-id', 'GET', { prediction_id: predictionId });
  }

}
