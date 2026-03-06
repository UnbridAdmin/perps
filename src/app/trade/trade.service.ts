import { Injectable } from '@angular/core';
import { ApiServices } from '../services/api.service';

// Request interfaces
interface BuyVoteParams {
  prediction_option_multiple_id: number;
  side: string;
  amount_token: number;
  message?: string;
  signature?: string;
  coin_id?: number;
  referral_code?: string;
}

interface SellVoteParams {
  prediction_option_multiple_id: number;
  side: string;
  shares_to_sell: number;
}

interface TradeDetailsParams {
  prediction_id: number;
}

// Response interfaces
interface TradeDetailsData {
  prediction: {
    prediction_id: number;
    prediction_category_id: number;
    prediction_title: string;
    prediction_type: string;
    prediction_image: string | null;
    prediction_create_at: string;
    prediction_user_id: number;
    fee_rate: number;
    b_param: number;
    status: string;
    options: any[];
    userVotedOption: number | null;
    totalParticipants: string;
    createdAt: string;
  };
  options: TradeOptionData[];
  user_balance: number;
}

interface TradeOptionData {
  option_id: number;
  option_title: string;
  price: number;
  volume: number;
  percentage: number;
  resolution: string;
  user_shares: number;
  option_multiple_id: number;
  change: number;
  avg_buy_price: number;
}

interface BuyVoteResponse {
  success: boolean;
  message: string;
  new_price_yes?: number;
  shares_minted?: number;
  fee_paid?: number;
  potential_payout?: number;
}

interface SellVoteResponse {
  success: boolean;
  message: string;
  new_price?: number;
  shares_sold?: number;
  proceeds_received?: number;
  fee_paid?: number;
}

interface TradeDetailsResponse {
  success: boolean;
  message: string;
  data: TradeDetailsData;
}

@Injectable({
  providedIn: 'root'
})
export class TradeService {

  constructor(private apiService: ApiServices) { }

  /**
   * Buy votes for a prediction option (authenticated users)
   */
  public buyVote(params: BuyVoteParams) {
    return this.apiService.apiCall('trader/buy-vote', 'POST', params);
  }

  /**
   * Buy votes for a prediction option (public - wallet authenticated users)
   */
  public buyPublicVote(params: BuyVoteParams) {
    return this.apiService.publicApiCall('trader/buy-public-vote', 'POST', params);
  }

  /**
   * Sell votes for a prediction option
   */
  public sellVote(params: SellVoteParams) {
    return this.apiService.apiCall('trader/sell-vote', 'POST', params);
  }

  /**
   * Get trade details for a prediction including options and user positions
   */
  public getTradeDetails(params: TradeDetailsParams) {
    return this.apiService.apiCall('trader/trade-details', 'POST', params);
  }

  /**
   * Get public trade details for a prediction (no user authentication required)
   */
  public getTradePublicDetails(params: TradeDetailsParams) {
    return this.apiService.publicApiCall('trader/trade-public-details', 'POST', params);
  }

  /**
   * Map backend trade details response to frontend format
   */
  public mapTradeDetailsResponse(apiResponse: any): TradeDetailsData | null {
    if (!apiResponse?.data?.prediction) {
      return null;
    }

    const backendData = apiResponse.data;

    return {
      prediction: {
        prediction_id: backendData.prediction.prediction_id,
        prediction_category_id: backendData.prediction.prediction_category_id,
        prediction_title: backendData.prediction.prediction_title,
        prediction_type: backendData.prediction.prediction_type,
        prediction_image: backendData.prediction.prediction_image,
        prediction_create_at: backendData.prediction.prediction_create_at,
        prediction_user_id: backendData.prediction.prediction_user_id,
        fee_rate: backendData.prediction.fee_rate,
        b_param: backendData.prediction.b_param,
        status: backendData.prediction.status,
        options: backendData.prediction.options || [],
        userVotedOption: backendData.prediction.userVotedOption,
        totalParticipants: backendData.prediction.totalParticipants,
        createdAt: backendData.prediction.createdAt
      },
      options: backendData.options?.map((option: any) => ({
        option_id: option.option_id,
        option_title: option.option_title,
        price: option.price,
        volume: option.volume,
        percentage: option.percentage,
        resolution: option.resolution,
        user_shares: option.user_shares,
        option_multiple_id: option.option_multiple_id,
        change: option.change,
        avg_buy_price: option.avg_buy_price
      })) || [],
      user_balance: backendData.user_balance || 0
    };
  }

  /**
   * Calculate potential payout for a buy transaction
   */
  public calculatePotentialPayout(amount: number, price: number): number {
    // amount / price gives the number of shares
    // each share is worth 1 token if it wins
    if (price === 0) return 0;
    const shares = amount / price;
    return Math.round(shares * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate potential loss for a buy transaction
   */
  public calculatePotentialLoss(amount: number): number {
    return amount; // Maximum loss is the amount invested
  }

  /**
   * Format price for display (convert to cents)
   */
  public formatPrice(price: number): string {
    return `${price.toFixed(3)} Fierce`;
  }

  /**
   * Format currency amount
   */
  public formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} Fierce`;
  }

  /**
   * Get option color based on side
   */
  public getOptionColor(side: string): string {
    return side.toLowerCase() === 'yes' ? '#22c55e' : '#ef4444';
  }
}
