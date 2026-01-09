import { Injectable } from '@angular/core';
import { ApiServices } from '../services/api.service';

interface GetPredictionsParams {
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class PostPredictionService {

  constructor(private apiService: ApiServices) { }

  public getPredictions(params: GetPredictionsParams) {
    return this.apiService.apiCall('predictions/get-predictions', 'GET', params);
  }

}