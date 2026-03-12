import { Injectable } from '@angular/core';
import { ApiServices } from '../../../../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class BetPoolService {

  constructor(private apiService: ApiServices) { }

  /**
   * Get public pool data for a prediction
   */
  getPredictionPoolData(predictionId: number) {
    return this.apiService.publicApiCall('predictions/get-prediction-pool-data', 'GET', { prediction_id: predictionId });
  }

  /**
   * Get user-specific pool data for a prediction (requires authentication)
   */
  getUserPredictionPoolData(predictionId: number) {
    return this.apiService.apiCall('predictions/get-user-prediction-pool-data', 'GET', { prediction_id: predictionId });
  }

  /**
   * Place a mutual bet on a prediction option
   */
  placeMutualBet(betRequest: { predictionId: number, optionId: number, amount: number }) {
    return this.apiService.apiCall('predictions/place-mutual-bet', 'POST', betRequest);
  }
}
