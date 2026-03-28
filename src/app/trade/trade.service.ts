import { Injectable } from '@angular/core';
import { ApiServices } from '../services/api.service';
import { Subject } from 'rxjs';

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
    creatorUsername: string;
    creatorAvatar: string;
    totalVolume: number;
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
  user_shares_yes?: number;
  user_shares_no?: number;
  option_multiple_id: number;
  change: number;
  avg_buy_price: number;
  avg_buy_price_yes?: number;
  avg_buy_price_no?: number;
  prediction_option_image: string | null;
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
  private tradeCompletedSource = new Subject<{ success: boolean; predictionId: number }>();
  tradeCompleted$ = this.tradeCompletedSource.asObservable();

  constructor(private apiService: ApiServices) { }

  /**
   * Notify that a trade operation has been completed
   */
  public notifyTradeCompleted(success: boolean, predictionId: number): void {
    this.tradeCompletedSource.next({ success, predictionId });
  }

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
    const data = apiResponse?.data;
    if (!data) return null;

    // Support both nested and flat structure
    const predictionInfo = data.prediction || data;
    if (!predictionInfo) return null;

    const backendData = data;
    const p = predictionInfo;

    return {
      prediction: {
        prediction_id: p.prediction_id || p.predictionId,
        prediction_category_id: p.prediction_category_id || p.predictionCategoryId,
        prediction_title: p.prediction_title || p.predictionTitle,
        prediction_type: p.prediction_type || p.predictionType,
        prediction_image: p.prediction_image || p.predictionImage || p.imageUrl,
        prediction_create_at: p.prediction_create_at || p.predictionCreateAt || p.createdAt,
        prediction_user_id: p.prediction_user_id,
        fee_rate: p.fee_rate,
        b_param: p.b_param,
        status: p.status,
        options: p.options || [],
        userVotedOption: p.userVotedOption,
        totalParticipants: p.totalParticipants,
        createdAt: p.createdAt,
        creatorUsername: p.creatorUsername || p.creator,
        creatorAvatar: p.creatorAvatar,
        totalVolume: p.totalVolume || p.marketVolume
      },
      options: (backendData.options || p.options)?.map((option: any) => ({
        option_id: option.option_id || option.id,
        option_title: option.option_title || option.label,
        price: option.price,
        volume: option.volume || option.poolAmount,
        percentage: option.percentage,
        resolution: option.resolution,
        user_shares: option.user_shares,
        user_shares_yes: option.user_shares_yes,
        user_shares_no: option.user_shares_no,
        option_multiple_id: option.option_multiple_id,
        change: option.change,
        avg_buy_price: option.avg_buy_price,
        avg_buy_price_yes: option.avg_buy_price_yes,
        avg_buy_price_no: option.avg_buy_price_no,
        prediction_option_image: option.prediction_option_image || option.imageUrl || null
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

  /**
   * Calculate effective price considering slippage and fees (AMM logic)
   */
  public calculateEffectivePrice(
    isBuyMode: boolean,
    amount: number, // USD amount if buy, shares if sell
    spotPrice: number,
    b: number,
    feeRate: number
  ): number {
    if (b <= 0) return spotPrice;
    
    const feeFactor = 1 - (feeRate || 0.01);

    if (isBuyMode) {
      const net = amount * feeFactor;
      // Linear approximation of LMSR price impact for display
      const impact = (1 - spotPrice) * (net / b);
      const endPrice = Math.min(0.999, spotPrice + impact);
      const avgPrice = (spotPrice + endPrice) / 2;
      return Math.min(0.999, avgPrice / feeFactor);
    } else {
      const shares = amount;
      const impact = spotPrice * (shares / b);
      const endPrice = Math.max(0.001, spotPrice - impact);
      const avgPrice = (spotPrice + endPrice) / 2;
      return Math.max(0.001, avgPrice * feeFactor);
    }
  }
}
