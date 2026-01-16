import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { HttpClientModule } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PostPredictionService } from './post-prediction.service';
import { AuthorizationService } from '../services/authorization.service';
import { WalletConnectService } from '../services/walletconnect.service';
import { VotingConfirmationModalComponent } from '../shared/voting-confirmation-modal/voting-confirmation-modal.component';
import { ConfirmDialogService } from '../shared/confirm-dialog/confirm-dialog.service';
import { CommonService } from '../shared/commonService';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';

// API Response interfaces
interface ApiPredictionOption {
  prediction_option_id: number;
  prediction_option_title: string;
  prediction_intuition_votes: number | null;
  prediction_market_votes: number | null;
  intuition_votes_count: number;
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
}

interface GetPredictionsResponse {
  recordsTotal: number;
  recordsFiltered: number;
  data: ApiPrediction[];
}

// Frontend interface
interface Prediction {
  prediction_id: number; // Add this for voting functionality
  creator: string;
  category: string;
  timeAgo: string;
  participants: string;
  question: string;
  imageUrl?: string;
  options: Array<{
    id: number;
    title: string;
    votes: number;
    percentage: number;
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
  actions?: {
    comments: number;
    likes: number;
    volume: string;
  };
}

@Component({
  selector: 'app-post-prediction',
  standalone: true,
  imports: [CommonModule, InfiniteScrollModule, HttpClientModule],
  templateUrl: './post-prediction.component.html',
  styleUrls: ['./post-prediction.component.scss']
})
export class PostPredictionComponent implements OnInit, OnDestroy {
  @Input() tab: 'for-you' | 'trending' = 'for-you';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private postPredictionService: PostPredictionService,
    private authService: AuthorizationService,
    private walletConnectService: WalletConnectService,
    private modalService: NgbModal,
    private confirmDialogService: ConfirmDialogService,
    private commonService: CommonService
  ) {}

  // API data properties
  predictions: Prediction[] = [];
  apiPredictions: ApiPrediction[] = []; // Store raw API data for voting
  currentPage = 1;
  pageSize = 10;
  isLoading = false;
  hasMoreData = true;

  ngOnInit(): void {
    this.loadPredictions();

    // Subscribe to authentication changes to refresh predictions when user logs in
    this.subscriptions.add(
      this.commonService.updateUserAddress.subscribe(() => {
        this.currentPage = 1;
        this.predictions = [];
        this.apiPredictions = [];
        this.hasMoreData = true;
        this.isLoading = false;
        this.loadPredictions();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  async loadPredictions(): Promise<void> {
    if (this.isLoading || !this.hasMoreData) return;

    this.isLoading = true;
    const params = {
      page: this.currentPage,
      limit: this.pageSize
    };

    // Check both authentication and wallet connection
    const isAuthenticated = this.authService.isAuthenticated();
    const isWalletConnected = await this.walletConnectService.checkConnection();

    const apiCall = (isAuthenticated && isWalletConnected)
      ? this.postPredictionService.getAuthenticatedPredictions(params)
      : this.postPredictionService.getPublicPredictions(params);

    apiCall.subscribe({
      next: (response: any) => {
        const apiResponse: GetPredictionsResponse = response.data;
        const mappedPredictions = this.mapApiPredictionsToFrontend(apiResponse.data);

        if (this.currentPage === 1) {
          this.predictions = mappedPredictions;
          this.apiPredictions = apiResponse.data;
          // Populate user votes from API data
          this.userVotes = {};
          apiResponse.data.forEach(pred => {
            if (pred.userVotedOption) {
              this.userVotes[pred.prediction_id] = pred.userVotedOption;
            }
          });
        } else {
          this.predictions = [...this.predictions, ...mappedPredictions];
          this.apiPredictions = [...this.apiPredictions, ...apiResponse.data];
        }

        this.hasMoreData = mappedPredictions.length === this.pageSize;
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

      // Calculate percentages for each option
      const options = apiPred.options.map(opt => ({
        id: opt.prediction_option_id,
        title: opt.prediction_option_title,
        votes: opt.prediction_intuition_votes || 0,
        percentage: totalParticipants > 0 ? Math.round(((opt.prediction_intuition_votes || 0) / totalParticipants) * 100) : 0
      }));

      // Calculate total votes for sentiment section
      const totalVotes = apiPred.options.reduce((sum, opt) => sum + (opt.prediction_intuition_votes || 0), 0);

      // Map category ID to category name (this might need a separate API call for categories)
      const categoryMap: { [key: number]: string } = {
        1: 'Politics',
        2: 'Crypto',
        3: 'Sports',
        4: 'Tech',
        5: 'Finance',
        6: 'Entertainment'
      };

      return {
        prediction_id: apiPred.prediction_id,
        creator: 'Prediction Market', // This could come from a separate user API
        category: categoryMap[apiPred.prediction_category_id] || 'General',
        timeAgo: this.calculateTimeAgo(new Date(apiPred.prediction_create_at)),
        participants: apiPred.totalParticipants,
        question: apiPred.prediction_title,
        imageUrl: apiPred.prediction_image || undefined,
        options,
        sentimentVotes: {
          total: totalVotes
        },
        marketInfo: {
          poolAmount: '$0 USDT', // This would need market data API
          participants: totalParticipants,
          options: apiPred.options.map(opt => ({
            label: opt.prediction_option_title,
            amount: `$${opt.prediction_market_votes || 0}`,
            percentage: totalVotes > 0 ? Math.round(((opt.prediction_market_votes || 0) / totalVotes) * 100) : 0
          }))
        },
        actions: {
          comments: 0, // This would need comments API
          likes: 0,    // This would need likes API
          volume: '$0'  // This would need volume API
        }
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

  // Voting state - tracks user's votes based on API data
  userVotes: { [predictionId: number]: number | null } = {};

  // Toggle market popover
  toggleMarketPopover(index: number): void {
    this.activeMarketPopover = this.activeMarketPopover === index ? null : index;
  }

  // Toggle sentiment popover
  toggleSentimentPopover(index: number): void {
    this.activeSentimentPopover = this.activeSentimentPopover === index ? null : index;
  }

  // Close popover when clicking outside
  closePopover(): void {
    this.activeMarketPopover = null;
    this.activeSentimentPopover = null;
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

      // Check Fierce balance
      let hasFierceBalance = false;
      try {
        const fierceBalance = await this.walletConnectService.getERC20Balance(
          environment.DECIMALFIERCE,
          environment.FIERCECONTRACTADDRESS,
          environment.USDTPolyABI
        );
        hasFierceBalance = parseFloat(fierceBalance) > 0;
      } catch (error) {
        console.error('Error checking Fierce balance:', error);
      }

      // Show confirmation modal
      const modalRef = this.modalService.open(VotingConfirmationModalComponent, {
        centered: true,
        size: 'lg'
      });

      modalRef.componentInstance.predictionTitle = prediction.question;
      modalRef.componentInstance.optionTitle = selectedOption.prediction_option_title;
      modalRef.componentInstance.hasFierceBalance = hasFierceBalance;

      const result = await modalRef.result;

      if (result) {
        // User confirmed, cast the vote
        const voteParams = {
          predictionId: apiPrediction.prediction_id,
          optionId: selectedOption.prediction_option_id
        };

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
          const totalParticipants = parseInt(apiPrediction.totalParticipants.replace('K', '000').replace('M', '000000')) || 0;
          frontendPrediction.options.forEach(opt => {
            const apiOpt = apiPrediction.options.find(apiOpt => apiOpt.prediction_option_id === opt.id);
            if (apiOpt) {
              opt.votes = apiOpt.prediction_intuition_votes || 0;
              opt.percentage = totalParticipants > 0 ? Math.round((opt.votes / totalParticipants) * 100) : 0;
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
}
