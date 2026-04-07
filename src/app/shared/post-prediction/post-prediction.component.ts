import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { HttpClientModule } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PostPredictionService } from './post-prediction.service';
import { Subscription } from 'rxjs';
import { AuthorizationService } from '../../services/authorization.service';
import { WalletConnectService } from '../../services/walletconnect.service';
import { ConfirmDialogService } from '../confirm-dialog/confirm-dialog.service';
import { CommonService } from '../commonService';
import { CategoryService } from '../category.service';
import { ApiServices } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { VotingConfirmationModalComponent } from '../voting-confirmation-modal/voting-confirmation-modal.component';
import { FierceIntuitionComponent } from './components/fierce-intuition/fierce-intuition.component';
import { HowItWorkIntuitionComponent } from './components/how-it-work-intuition/how-it-work-intuition.component';
import { FeaturedCommentComponent } from './components/featured-comment/featured-comment.component';

import { BetPoolService } from './components/bet-pool/bet-pool.service';
import { SidebarMenuService } from '../../sidebar-menu/sidebar-menu.service';
import { FeaturedCommentService } from './components/featured-comment/featured-comment.service';

// API Response interfaces
interface ApiPredictionOption {
  prediction_option_id: number;
  prediction_option_title: string;
  prediction_intuition_votes: number | null;
  prediction_market_votes: number | null;
  intuition_votes_count: number;
}

interface ApiKingComment {
  comment_id: number;
  user_id: number;
  prediction_id: number;
  comment: string;
  burned_fierce: number;
  created_at: string;
  avatar: string | null;
  url_image: string | null;
  username: string;
  is_verified: string;
}

interface ApiPrediction {
  prediction_id: number;
  prediction_category_id: number;
  prediction_title: string;
  prediction_type: string;
  prediction_image: string | null;
  prediction_create_at: string;
  options: ApiPredictionOption[];
  userVotedOption: number | null;
  totalParticipants: string;
  createdAt: string;
  creatorUsername: string;
  creatorAvatar: string;
  creator_is_verified: string;
  totalVolume: number;
  prediction_mutual_amount: number;
  categoryName: string | null;
  totalComments: number;
  king_comment: ApiKingComment | null;
  b_param?: number;
  fee_rate?: number;
}

interface GetPredictionsResponse {
  recordsTotal: number;
  recordsFiltered: number;
  data: ApiPrediction[];
}

// Frontend interface
interface Prediction {
  prediction_id: number;
  prediction_category_id: number; // Add category ID
  creator: string;
  creatorAvatar?: string;
  creator_is_verified?: string;
  category: string;
  timeAgo: string;
  participants: string;
  question: string;
  imageUrl?: string;
  totalVolume?: number;
  options: Array<{
    id: number;
    title: string;
    votes: number;
    percentage: number;
    poolPercentage?: number;
    poolAmount?: number;
    userInvestment?: number;
    totalBetUsers?: number;
  }>;
  sentimentVotes?: {
    total: number;
  };
  marketInfo?: {
    poolAmount: string;
    participants: number;
    options: Array<{
      label: string;
      amount: string;
      percentage: number;
    }>;
  };
  featuredComment?: {
    user: string;
    avatar: string;
    text: string;
    gifUrl?: string;
    burnedAmount: number;
    is_verified: string;
  };
  actions?: {
    comments: number;
    likes: number;
    volume: string;
  };
  betVolume?: number;
  marketVolume?: number;
  prediction_end_date?: string;
  b_param?: number;
  fee_rate?: number;
}

@Component({
  selector: 'app-post-prediction',
  standalone: true,
  imports: [CommonModule, RouterModule, InfiniteScrollModule, HttpClientModule, FormsModule, FierceIntuitionComponent, FeaturedCommentComponent],
  templateUrl: './post-prediction.component.html',
  styleUrls: ['./post-prediction.component.scss']
})
export class PostPredictionComponent implements OnInit, OnDestroy {
  @Input() userId?: number; // Optional: filter by user ID
  @Input() tab: 'for-you' | 'trending' = 'for-you';
  @Input() predictionId?: number; // Optional: show only one specific prediction
  @Output() predictionLoaded = new EventEmitter<any>();

  private subscriptions: Subscription = new Subscription();
  private loadSubscription?: Subscription;
  private currentRequestToken = 0;

  constructor(
    private router: Router,
    private postPredictionService: PostPredictionService,
    private authService: AuthorizationService,
    private walletConnectService: WalletConnectService,
    private modalService: NgbModal,
    private confirmDialogService: ConfirmDialogService,
    private commonService: CommonService,
    private categoryService: CategoryService,
    private betPoolService: BetPoolService,
    private sidebarMenuService: SidebarMenuService,
    private featuredCommentService: FeaturedCommentService,
    private apiService: ApiServices
  ) { }

  // API data properties
  predictions: Prediction[] = [];
  apiPredictions: ApiPrediction[] = []; // Store raw API data for voting
  currentPage = 1;
  pageSize = 10;
  isLoading = false;
  hasMoreData = true;
  selectedCategoryId: number | null = null;

  // Track if we should reload predictions (prevent continuous reloading after logout)
  private shouldReload = true;
  private wasAuthenticated = false; // Track authentication status to detect logout

  // State for in-line Overthrow forms
  overthrowFormsState: {
    [predictionId: number]: {
      isExpanded: boolean,
      text: string,
      gifUrl: string,
      showGifInput: boolean,
      isSubmitting: boolean
    }
  } = {};

  ngOnInit(): void {
    // We remove this.loadPredictions() from here because BehaviorSubject
    // in CategoryService ('filterCategoryIdSubject') emits its initial value (null)
    // immediately upon subscription, which will trigger resetAndReload() -> loadPredictions()

    // Track initial auth status
    this.wasAuthenticated = this.authService.isAuthenticated();

    // Load public predictions on init
    if (!this.wasAuthenticated) {
      console.log('PostPrediction: Loading public predictions on init');
      this.resetAndReload();
    }

    // Subscribe to authentication changes to refresh predictions when user logs in
    this.subscriptions.add(
      this.commonService.updateUserAddress.subscribe(() => {
        const isNowAuthenticated = this.authService.isAuthenticated();

        // Detect logout: was authenticated, now not authenticated
        if (this.wasAuthenticated && !isNowAuthenticated) {
          console.log('PostPrediction: LOGOUT DETECTED - clearing and reloading public predictions');
          this.isLoading = false;

          // Clear current predictions
          this.predictions = [];
          this.apiPredictions = [];

          // Re-enable loading and fetch public predictions after session cleanup settles
          this.shouldReload = true;
          setTimeout(() => {
            this.resetAndReload();
          }, 300);
        }
        // Detect login: was not authenticated, now is authenticated
        else if (!this.wasAuthenticated && isNowAuthenticated) {
          console.log('PostPrediction: LOGIN DETECTED - resuming predictions refresh');
          this.shouldReload = true;
          this.resetAndReload();
        }
        // If already authenticated and gets authenticated again: continue normally
        else if (isNowAuthenticated && this.shouldReload) {
          console.log('PostPrediction: Already authenticated, reloading predictions');
          this.resetAndReload();
        }

        // Update tracking
        this.wasAuthenticated = isNowAuthenticated;
      })
    );

    // Subscribe to category filter changes
    this.subscriptions.add(
      this.categoryService.filterCategoryId$.subscribe(categoryId => {
        // Only allow category filter changes if we should be reloading
        if (this.shouldReload) {
          this.selectedCategoryId = categoryId;
          this.resetAndReload();
        }
      })
    );

    // Only load predictions if userId is already available (for direct navigation)
    // We remove this manual call because the CategoryService subscription
    // above will already trigger resetAndReload() via its initial emission.
  }

  ngOnChanges() {
    console.log('PostPrediction: ngOnChanges called, userId:', this.userId);
    // Only reload predictions when userId changes from undefined to a valid number
    if (this.userId !== undefined && this.userId !== null) {
      this.resetAndReload();
    }
  }

  private resetAndReload(): void {
    console.log('PostPrediction: resetAndReload called, userId:', this.userId, 'shouldReload:', this.shouldReload);

    // Guard: Only proceed if we should be reloading
    if (!this.shouldReload) {
      console.log('PostPrediction: Skipping reload - shouldReload is false');
      return;
    }

    // Cancel any in-flight load request
    if (this.loadSubscription) {
      this.loadSubscription.unsubscribe();
      this.loadSubscription = undefined;
    }

    this.currentPage = 1;
    this.predictions = [];
    this.apiPredictions = [];
    this.hasMoreData = true;
    this.isLoading = false;
    this.loadPredictions();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    // Also unsubscribe from any active load subscription
    if (this.loadSubscription) {
      this.loadSubscription.unsubscribe();
      this.loadSubscription = undefined;
    }
  }


  async loadPredictions(): Promise<void> {
    if (this.isLoading || !this.hasMoreData) return;

    // Increment request token to track this specific call across async gaps
    const requestToken = ++this.currentRequestToken;
    console.log('PostPrediction: loadPredictions started, token:', requestToken, 'userId:', this.userId);

    this.isLoading = true;
    const params: any = {
      page: this.currentPage,
      limit: this.pageSize
    };

    // Add category filter if selected
    if (this.selectedCategoryId !== null) {
      params.category = this.selectedCategoryId;
    }

    // Add user_id filter when viewing a specific user's profile
    if (this.userId !== undefined && this.userId !== null) {
      console.log('PostPrediction: Adding user_id to params:', this.userId);
      params.user_id = this.userId;
    }

    // Add predictionId filter if provided
    if (this.predictionId) {
      params.predictionId = this.predictionId;
    }

    // Check both authentication and wallet connection
    const isAuthenticated = this.authService.isAuthenticated();
    const isWalletConnected = await this.walletConnectService.checkConnection();

    // After async gap, check if this request is still valid
    if (requestToken !== this.currentRequestToken) {
      console.log('PostPrediction: loadPredictions discarded after async gap, token:', requestToken);
      return;
    }

    // Determine which service to use
    let apiCall;
    if (isAuthenticated && isWalletConnected) {
      // When authenticated, always use the authenticated service
      // The backend should respect the user_id in params if provided, or default to the logged-in user's feed
      apiCall = this.postPredictionService.getAuthenticatedPredictions(params);
    } else {
      // Not authenticated - use public service
      apiCall = this.postPredictionService.getPublicPredictions(params);
    }

    // Cancel any previous subscription still active (though should be handled by token check above for concurrent calls)
    if (this.loadSubscription) {
      this.loadSubscription.unsubscribe();
    }

    this.loadSubscription = apiCall.subscribe({
      next: (response: any) => {
        console.log('PostPrediction: API response received');
        const apiResponse: GetPredictionsResponse = response.data;
        const mappedPredictions = this.mapApiPredictionsToFrontend(apiResponse.data);

        if (this.currentPage === 1) {
          this.predictions = mappedPredictions;
          this.apiPredictions = apiResponse.data;

          // If in single post mode, ensure we only keep the matching one
          if (this.predictionId) {
            this.predictions = this.predictions.filter(p => p.prediction_id === this.predictionId);
            this.apiPredictions = this.apiPredictions.filter(p => p.prediction_id === this.predictionId);

            if (this.predictions.length > 0) {
              this.predictionLoaded.emit(this.predictions[0]);
            }
          }

          // Populate user votes from API data
          this.userVotes = {};
          this.apiPredictions.forEach(pred => {
            if (pred.userVotedOption) {
              this.userVotes[pred.prediction_id] = pred.userVotedOption;
            }
          });
        } else {
          this.predictions = [...this.predictions, ...mappedPredictions];
          this.apiPredictions = [...this.apiPredictions, ...apiResponse.data];
        }

        this.hasMoreData = this.predictionId ? false : mappedPredictions.length === this.pageSize;
        this.currentPage++;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading predictions:', error);
        this.isLoading = false;
      }
    });
  }

  onScroll(): void {
    this.loadPredictions();
  }

  private mapApiPredictionsToFrontend(apiPredictions: ApiPrediction[]): Prediction[] {
    return apiPredictions.map(apiPred => {
      // Parse total participants to number
      const totalParticipants = parseInt(apiPred.totalParticipants.replace('K', '000').replace('M', '000000')) || 0;

      // Calculate total votes for sentiment section
      const totalVotes = apiPred.options.reduce((sum, opt) => sum + (opt.prediction_intuition_votes || 0), 0);

      // Calculate percentages for each option
      const options = apiPred.options.map(opt => ({
        id: opt.prediction_option_id,
        title: opt.prediction_option_title,
        votes: opt.prediction_intuition_votes || 0,
        percentage: totalVotes > 0 ? Math.round(((opt.prediction_intuition_votes || 0) / totalVotes) * 100) : 0
      }));

      return {
        prediction_id: apiPred.prediction_id,
        prediction_category_id: apiPred.prediction_category_id,
        creator: apiPred.creatorUsername || 'Prediction Market',
        creatorAvatar: apiPred.creatorAvatar || undefined,
        creator_is_verified: apiPred.creator_is_verified,
        category: apiPred.categoryName || 'General',
        timeAgo: this.calculateTimeAgo(new Date(apiPred.prediction_create_at)),
        participants: apiPred.totalParticipants,
        question: apiPred.prediction_title,
        imageUrl: apiPred.prediction_image || undefined,
        totalVolume: apiPred.totalVolume || 0,
        options,
        sentimentVotes: {
          total: totalVotes
        },
        marketInfo: {
          poolAmount: apiPred.prediction_mutual_amount?.toString() || '0',
          participants: totalParticipants,
          options: apiPred.options.map(opt => ({
            label: opt.prediction_option_title,
            amount: `$${opt.prediction_market_votes || 0}`,
            percentage: totalVotes > 0 ? Math.round(((opt.prediction_market_votes || 0) / totalVotes) * 100) : 0
          }))
        },
        actions: {
          comments: apiPred.totalComments || 0,
          likes: Math.floor(Math.random() * 100),
          volume: `$${apiPred.totalVolume || 0}`
        },
        betVolume: apiPred.prediction_mutual_amount || 0, // Volumen de apuestas desde prediction_mutual_amount
        marketVolume: apiPred.totalVolume || 0, // Volumen de mercado desde totalVolume
        featuredComment: apiPred.king_comment ? {
          user: apiPred.king_comment.username,
          avatar: apiPred.king_comment.avatar || 'https://api.dicebear.com/9.x/fun-emoji/svg',
          text: apiPred.king_comment.comment,
          gifUrl: apiPred.king_comment.url_image || undefined,
          burnedAmount: apiPred.king_comment.burned_fierce,
          is_verified: apiPred.king_comment.is_verified
        } : undefined,
        b_param: apiPred.b_param,
        fee_rate: apiPred.fee_rate
      };
    });
  }

  private calculateTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return 'Just now';
    }
  }

  // Popover state
  activeMarketPopover: number | null = null;
  activeSentimentPopover: number | null = null;
  activeBetPopover: number | null = null;

  // Voting state - tracks user's votes based on API data
  userVotes: { [predictionId: number]: number | null } = {};

  // Toggle market popover
  toggleMarketPopover(index: number): void {
    if (this.activeMarketPopover === index) {
      this.activeMarketPopover = null;
    } else {
      this.activeMarketPopover = index;
      this.activeSentimentPopover = null;
      this.activeBetPopover = null;

      // Load real market data
      this.loadTradingMarketData(index);
    }
  }

  // Toggle sentiment popover
  toggleSentimentPopover(index: number): void {
    if (this.activeSentimentPopover === index) {
      this.activeSentimentPopover = null;
    } else {
      this.activeSentimentPopover = index;
      this.activeMarketPopover = null;
      this.activeBetPopover = null;
    }
  }

  // Toggle bet popover
  toggleBetPopover(index: number): void {
    if (this.activeBetPopover === index) {
      this.activeBetPopover = null;
    } else {
      this.activeBetPopover = index;
      this.activeMarketPopover = null;
      this.activeSentimentPopover = null;

      // Load real pool data
      this.loadPoolData(index);
    }
  }

  private loadPoolData(index: number): void {
    const prediction = this.predictions[index];
    const predictionId = prediction.prediction_id;

    const isAuthenticated = this.authService.isAuthenticated();

    const poolCall = isAuthenticated
      ? this.betPoolService.getUserPredictionPoolData(predictionId)
      : this.betPoolService.getPredictionPoolData(predictionId);

    poolCall.subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const poolData = response.data;

          // 1. Update total amount
          if (!prediction.marketInfo) {
            prediction.marketInfo = { poolAmount: '0', participants: 0, options: [] };
          }
          prediction.marketInfo.poolAmount = poolData.marketInfo?.poolAmount || '0';

          // 2. Synchronize existing options with pool data
          if (prediction.options && poolData.options) {
            poolData.options.forEach((poolOpt: any) => {
              const matchingOption = prediction.options.find(o => o.id === poolOpt.id);
              if (matchingOption) {
                // IMPORTANT: Use separate properties for pool data
                matchingOption.poolAmount = poolOpt.poolAmount;
                matchingOption.userInvestment = poolOpt.userInvestment;
                matchingOption.poolPercentage = poolOpt.percentage;
                matchingOption.totalBetUsers = poolOpt.totalBetUsers;
              }
            });
          }
        }
      },
      error: (err) => console.error('Error loading pool data:', err)
    });
  }

  private loadTradingMarketData(index: number): void {
    const prediction = this.predictions[index];
    const predictionId = prediction.prediction_id;

    this.postPredictionService.getTradingMarketData(predictionId).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const marketData = response.data;

          // Update prediction info
          const pred = marketData.prediction || marketData;
          if (pred) {
            prediction.totalVolume = pred.totalVolume || marketData.totalVolume;
            prediction.prediction_end_date = pred.prediction_end_date || pred.predictionEndDate;
            // Update b_param and fee_rate from market data
            prediction.b_param = pred.b_param || marketData.b_param;
            prediction.fee_rate = pred.fee_rate || marketData.fee_rate;
          }

          // Update marketInfo structure if needed or directly set options
          if (!prediction.marketInfo) {
            prediction.marketInfo = { poolAmount: '0', participants: 0, options: [] };
          }

          prediction.marketInfo.poolAmount = marketData.totalVolume?.toString() || '0';

          // Map backend options to frontend structure
          if (marketData.options) {
            prediction.marketInfo.options = marketData.options.map((opt: any) => ({
              id: opt.id || opt.option_id,
              label: opt.label || opt.option_title,
              percentage: opt.percentage,
              poolAmount: opt.poolAmount || opt.volume,
              avgBuyPrice: opt.avgBuyPrice || opt.avg_buy_price,
              avgSellPrice: opt.avgSellPrice || opt.avg_sell_price,
              userShares: opt.userShares || opt.user_shares,
              price: opt.price,
              buy_price: opt.buy_price,
              sell_price: opt.sell_price
            }));
          }
        }
      },
      error: (err) => console.error('Error loading trading market data:', err)
    });
  }

  // Open How it Works modal
  openHowItWorksModal(): void {
    this.modalService.open(HowItWorkIntuitionComponent, {
      centered: true,
      size: 'md',
      windowClass: 'dark-modal'
    });
  }

  // Close popover when clicking outside
  closePopover(): void {
    this.activeMarketPopover = null;
    this.activeSentimentPopover = null;
    this.activeBetPopover = null;
  }

  // Toggle in-line overthrow form
  toggleOverthrowForm(index: number): void {
    const predictionId = this.predictions[index].prediction_id;
    if (!this.overthrowFormsState[predictionId]) {
      this.overthrowFormsState[predictionId] = {
        isExpanded: true,
        text: '',
        gifUrl: '',
        showGifInput: false,
        isSubmitting: false
      };
    } else {
      this.overthrowFormsState[predictionId].isExpanded = !this.overthrowFormsState[predictionId].isExpanded;
    }
  }

  cancelOverthrow(index: number): void {
    const predictionId = this.predictions[index].prediction_id;
    if (this.overthrowFormsState[predictionId]) {
      this.overthrowFormsState[predictionId].isExpanded = false;
      this.overthrowFormsState[predictionId].text = '';
      this.overthrowFormsState[predictionId].gifUrl = '';
      this.overthrowFormsState[predictionId].showGifInput = false;
    }
  }

  toggleOverthrowGifInput(index: number): void {
    const predictionId = this.predictions[index].prediction_id;
    if (this.overthrowFormsState[predictionId]) {
      this.overthrowFormsState[predictionId].showGifInput = !this.overthrowFormsState[predictionId].showGifInput;
    }
  }

  async submitOverthrow(index: number) {
    const prediction = this.predictions[index];
    const form = this.overthrowFormsState[prediction.prediction_id];

    if (!form || (!form.text.trim() && !form.gifUrl.trim())) return;

    form.isSubmitting = true;

    try {
      if (!this.authService.isAuthenticated()) {
        const isConnected = await this.walletConnectService.checkConnection();
        if (!isConnected) {
          form.isSubmitting = false;
          this.confirmDialogService.showInfo({
            title: 'Billetera requerida',
            message1: 'Por favor, conecta tu billetera para poder destronar.'
          });
          return;
        }

        const walletAddress = await this.walletConnectService.getConnectedWalletAddress();

        try {
          const existResponse = await this.authService.existUser({ address: walletAddress }).toPromise() as any;
          if (existResponse?.data?.exists) {
            form.isSubmitting = false;
            // User exists in DB but not authenticated - show login required
            this.confirmDialogService.showInfo({
              title: 'Inicio de sesión requerido',
              message1: 'Debes iniciar sesión para destronar al rey.'
            });
            return;
          }
        } catch (error) {
          console.error('Error checking if user exists:', error);
        }

        const message = `Click to sign in and accept the Unbrid Terms of Service(https://unbrid.com/privacy-policy). Login with secure code: ${Date.now()}`;
        const signatureData = await this.walletConnectService.signMessage(message);

        const createUserRequest = {
          address: walletAddress,
          coin_id: 1,
          message: signatureData.message,
          signature: signatureData.signature,
          referral_code: 'syyPTsvh70245910'
        };

        const createUserResponse = await firstValueFrom(
          this.apiService.publicApiCall('user/secure-create-user', 'POST', createUserRequest)
        ) as any;

        if (createUserResponse?.success || createUserResponse?.message === 'SUCCESS') {
          if (createUserResponse?.data && createUserResponse.data.length > 0) {
            this.authService.setSession(createUserResponse.data[0].expires, walletAddress);
          }
        } else {
          throw new Error('Failed to authenticate');
        }
      }

      const currentKingBurn = prediction.featuredComment?.burnedAmount || 0;
      const newBurnAmount = currentKingBurn + 1;

      this.featuredCommentService.overthrowKing(
        prediction.prediction_id,
        form.text,
        form.gifUrl,
        newBurnAmount
      ).subscribe({
        next: (response: any) => {
          form.isSubmitting = false;
          prediction.featuredComment = {
            user: 'You',
            avatar: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=you',
            text: form.text,
            gifUrl: form.gifUrl,
            burnedAmount: newBurnAmount,
            is_verified: 'NO'
          };

          this.confirmDialogService.showSuccess({
            title: '¡Nuevo Rey destronado!',
            message1: `Has destronado al mensaje anterior quemando ${newBurnAmount} Fierce.`
          });

          this.cancelOverthrow(index);
          this.sidebarMenuService.notifyBalanceUpdate();
        },
        error: (error: any) => {
          form.isSubmitting = false;
          console.error('Error overthrowing king:', error);
          this.confirmDialogService.showError({
            title: 'Error',
            message1: error.error?.message || 'Error al intentar destronar al rey.'
          });
        }
      });
    } catch (error) {
      form.isSubmitting = false;
      console.error('Authentication error:', error);
      this.confirmDialogService.showError({
        title: 'Error de autenticación',
        message1: 'No se pudo autenticar tu cuenta. Por favor intenta de nuevo.'
      });
    }
  }

  // Vote on sentiment poll - now with real API integration
  async voteOnPrediction(predictionIndex: number, optionId: number): Promise<void> {
    try {
      // Check if user is authenticated
      if (!this.authService.isAuthenticated()) {
        // Check if wallet is connected
        const isConnected = await this.walletConnectService.checkConnection();
        if (!isConnected) {
          await this.confirmDialogService.showInfo({
            title: 'Billetera requerida',
            message1: 'Debes conectar tu billetera para votar en las predicciones.'
          });
          return;
        }

        // Get wallet address
        const walletAddress = await this.walletConnectService.getConnectedWalletAddress();

        // Check if user exists in database
        try {
          const existResponse = await this.authService.existUser({ address: walletAddress }).toPromise() as any;
          if (existResponse?.data?.exists) {
            // User exists in DB but not authenticated - show login required
            await this.confirmDialogService.showInfo({
              title: 'Inicio de sesión requerido',
              message1: 'Debes iniciar sesión para votar en las predicciones.'
            });
            return;
          }
          // User doesn't exist in DB - proceed with balance check
        } catch (error) {
          console.error('Error checking if user exists:', error);
          // If we can't check, assume user doesn't exist and proceed
        }
      }

      // Get prediction data
      const prediction = this.predictions[predictionIndex];
      const apiPrediction = this.apiPredictions[predictionIndex]; // Access raw API data
      if (!apiPrediction) return;

      // Find the selected option
      const selectedOption = apiPrediction.options.find(opt => opt.prediction_option_id === optionId);

      if (!selectedOption) return;

      // Show confirmation modal (balance check is handled internally by the modal)
      const modalRef = this.modalService.open(VotingConfirmationModalComponent, {
        centered: true,
        size: 'lg'
      });

      modalRef.componentInstance.predictionTitle = prediction.question;
      modalRef.componentInstance.optionTitle = selectedOption.prediction_option_title;

      const result = await modalRef.result;

      if (result && result.confirmed) {
        // User confirmed, cast the vote
        const betAmount = result.betAmount || 0;

        const voteParams = {
          predictionId: apiPrediction.prediction_id,
          optionId: selectedOption.prediction_option_id,
          betAmount: betAmount
        };

        // Note: betAmount is included in voteParams for the backend to process the bet mechanic.
        this.postPredictionService.castIntuitionVote(voteParams).subscribe({
          next: async (response: any) => {
            if (response.data?.success) {
              // Update local state without reloading
              this.userVotes[apiPrediction.prediction_id] = selectedOption.prediction_option_id;

              // Update vote counts locally
              this.updateLocalVoteCounts(predictionIndex, selectedOption.prediction_option_id);

              await this.confirmDialogService.showSuccess({
                title: 'Voto registrado',
                message1: 'Tu voto ha sido registrado exitosamente.'
              });
            } else {
              await this.confirmDialogService.showError({
                title: 'Error al votar',
                message1: response.data?.message || 'Ha ocurrido un error al registrar el voto.'
              });
            }
          },
          error: async (error) => {
            console.error('Error casting vote:', error);

            let errorMessage = 'Ha ocurrido un error al registrar el voto.';

            if (error.error?.data?.message) {
              errorMessage = error.error.data.message;
            } else if (error.error?.data?.alreadyVoted) {
              errorMessage = 'Ya has votado en esta predicción.';
            }

            await this.confirmDialogService.showError({
              title: 'Error al votar',
              message1: errorMessage
            });
          }
        });
      }
    } catch (error) {
      console.error('Error in voting process:', error);
    }
  }

  // Handle mutual betting from BetPoolComponent
  async onPlaceMutualBet(predictionIndex: number, event: { optionId: number, amount: number }): Promise<void> {
    const { optionId, amount } = event;
    const prediction = this.predictions[predictionIndex];

    try {
      if (!this.authService.isAuthenticated()) {
        await this.confirmDialogService.showInfo({
          title: 'Inicio de sesión requerido',
          message1: 'Debes iniciar sesión para realizar apuestas.'
        });
        return;
      }

      this.betPoolService.placeMutualBet({
        predictionId: prediction.prediction_id,
        optionId: optionId,
        amount: amount
      }).subscribe({
        next: async (response: any) => {
          if (response.success) {
            await this.confirmDialogService.showSuccess({
              title: 'Apuesta registrada',
              message1: `Tu apuesta de ${amount} F ha sido procesada exitosamente.`
            });
            // Refresh pool data after betting
            this.loadPoolData(predictionIndex);

            // Notify balance update in sidebar
            this.sidebarMenuService.notifyBalanceUpdate();
          } else {
            await this.confirmDialogService.showError({
              title: 'Error',
              message1: response.message || 'No se pudo procesar la apuesta.'
            });
          }
        },
        error: async (err: any) => {
          console.error('Bet error:', err);
          await this.confirmDialogService.showError({
            title: 'Error del servidor',
            message1: err.error?.message || 'Error al procesar la apuesta.'
          });
        }
      });
    } catch (error) {
      console.error('Error in betting process:', error);
    }
  }

  // Check if user has voted on a prediction
  hasUserVoted(predictionId: number): boolean {
    return this.userVotes[predictionId] !== undefined && this.userVotes[predictionId] !== null;
  }

  // Get user's voted option ID for a prediction
  getUserVotedOptionId(predictionId: number): number | null {
    return this.userVotes[predictionId] || null;
  }

  // Get user's vote for a prediction
  getUserVote(predictionId: number): 'yes' | 'no' | null {
    const userVotedOptionId = this.userVotes[predictionId];
    if (!userVotedOptionId) return null;

    // Find the prediction and check which option was voted
    const prediction = this.apiPredictions.find((p: ApiPrediction) => p.prediction_id === predictionId);
    if (!prediction) return null;

    const votedOption = prediction.options.find(opt => opt.prediction_option_id === userVotedOptionId);
    if (!votedOption) return null;

    return votedOption.prediction_option_title.toLowerCase().includes('no') ? 'no' : 'yes';
  }

  // Update vote counts locally after successful vote
  private updateLocalVoteCounts(predictionIndex: number, selectedOptionId: number): void {
    // Update the API prediction data
    const apiPrediction = this.apiPredictions[predictionIndex];
    const selectedOption = apiPrediction.options.find(opt => opt.prediction_option_id === selectedOptionId);

    if (selectedOption && apiPrediction) {
      // Increment the vote count for the selected option
      selectedOption.prediction_intuition_votes = (selectedOption.prediction_intuition_votes || 0) + 1;
      selectedOption.intuition_votes_count = (selectedOption.intuition_votes_count || 0) + 1;

      // Update the frontend prediction data
      const frontendPrediction = this.predictions[predictionIndex];
      if (frontendPrediction && frontendPrediction.options) {
        const frontendOption = frontendPrediction.options.find(opt => opt.id === selectedOptionId);
        if (frontendOption) {
          frontendOption.votes = selectedOption.prediction_intuition_votes || 0;

          // Recalculate percentages for all options
          const totalVotes = apiPrediction.options.reduce((sum, opt) => sum + (opt.prediction_intuition_votes || 0), 0);
          frontendPrediction.sentimentVotes = { total: totalVotes };

          // Update percentages
          frontendPrediction.options.forEach(opt => {
            const apiOpt = apiPrediction.options.find(apiOpt => apiOpt.prediction_option_id === opt.id);
            if (apiOpt) {
              opt.votes = apiOpt.prediction_intuition_votes || 0;
              opt.percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
            }
          });
        }
      }
    }
  }

  // Navigate to trade detail page
  navigateToTrade(prediction: any): void {
    this.router.navigate(['/trade', prediction.prediction_id]);
  }

  // Navigate to bet detail page
  navigateToBet(prediction: any): void {
    this.router.navigate(['/bet', prediction.prediction_id]);
  }

  // Navigate to post detail page
  navigateToPostDetail(predictionId: number): void {
    this.router.navigate(['/post', predictionId]);
  }

  // Navigate to category and activate filters
  navigateToCategory(categoryId: number): void {
    // Ensure we're on home page
    if (this.router.url !== '/home' && this.router.url !== '/') {
      this.router.navigate(['/home']).then(() => {
        this.activateCategoryById(categoryId);
      });
    } else {
      this.activateCategoryById(categoryId);
    }
  }

  private activateCategoryById(categoryId: number): void {
    // Import category tree to find parent and activate
    import('../category.model').then(module => {
      const tree = module.CATEGORIES_TREE;
      const result = this.findCategoryPathWithIds(categoryId, tree);

      if (result) {
        // Activate parent category in header
        this.categoryService.selectCategory(result.parent);
        // Expand all parent nodes in the path
        this.categoryService.setExpandedNodeIds(result.pathIds);
        // Set filter to the specific category
        this.categoryService.setFilterCategoryId(categoryId);
      }
    });
  }

  private findCategoryPathWithIds(targetId: number, categories: any[], parent: any = null, pathIds: number[] = []): { parent: any, pathIds: number[] } | null {
    for (const cat of categories) {
      const currentPath = [...pathIds];

      if (cat.id === targetId) {
        return { parent: parent || cat, pathIds: currentPath };
      }

      if (cat.children && cat.children.length > 0) {
        // Add current category to path before exploring children
        currentPath.push(cat.id);
        const result = this.findCategoryPathWithIds(targetId, cat.children, parent || cat, currentPath);
        if (result) return result;
      }
    }
    return null;
  }
}
