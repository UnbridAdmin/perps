import { Injectable } from '@angular/core';
import { ApiServices } from '../../services/api.service';
import { Observable } from 'rxjs';

export interface IntuitionMarketGapData {
    prediction_option_id: number;
    prediction_option_title: string;
    prediction_intuition_votes: number;
    intuition_percentage: number;
    market_percentage: number;
    gap: number;
    option_amount_usdt: number;
}

export interface GetIntuitionMarketGapResponse {
    data: IntuitionMarketGapData[];
    status: number;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class PriceTrendService {

    constructor(private apiService: ApiServices) { }

    /**
     * Get the gap between intuition and market percentages for a prediction
     * @param predictionId The ID of the prediction
     */
    public getIntuitionMarketGap(predictionId: number): Observable<GetIntuitionMarketGapResponse> {
        const params = {
            prediction_id: predictionId
        };
        return this.apiService.publicApiCall('predictions/get-intuition-market-gap', 'GET', params) as Observable<GetIntuitionMarketGapResponse>;
    }
}
