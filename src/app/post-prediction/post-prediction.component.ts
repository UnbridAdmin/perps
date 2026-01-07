import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ApiServices } from '../services/api.service';
import { HttpClientModule } from '@angular/common/http';

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
  creator: string;
  category: string;
  timeAgo: string;
  participants: string;
  question: string;
  yesPercentage: number;
  noPercentage: number;
  imageUrl?: string;
  sentimentVotes?: {
    yes: number;
    no: number;
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
export class PostPredictionComponent implements OnInit {
  @Input() tab: 'for-you' | 'trending' = 'for-you';

  constructor(private router: Router, private apiService: ApiServices) {}

  // API data properties
  predictions: Prediction[] = [];
  currentPage = 1;
  pageSize = 10;
  isLoading = false;
  hasMoreData = true;

  ngOnInit(): void {
    this.loadPredictions();
  }

  loadPredictions(): void {
    if (this.isLoading || !this.hasMoreData) return;

    this.isLoading = true;
    const params = {
      page: this.currentPage,
      limit: this.pageSize
    };

    this.apiService.apiCall('predictions/get-predictions', 'GET', params).subscribe({
      next: (response: any) => {
        const apiResponse: GetPredictionsResponse = response.data;
        const mappedPredictions = this.mapApiPredictionsToFrontend(apiResponse.data);

        if (this.currentPage === 1) {
          this.predictions = mappedPredictions;
        } else {
          this.predictions = [...this.predictions, ...mappedPredictions];
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
      // Calculate percentages based on options (assuming first two options are YES/NO)
      const yesOption = apiPred.options.find(opt => opt.prediction_option_title.toLowerCase().includes('sí') || opt.prediction_option_title.toLowerCase().includes('yes'));
      const noOption = apiPred.options.find(opt => opt.prediction_option_title.toLowerCase().includes('no'));

      const totalVotes = (yesOption?.prediction_intuition_votes || 0) + (noOption?.prediction_intuition_votes || 0);
      const yesPercentage = totalVotes > 0 ? Math.round(((yesOption?.prediction_intuition_votes || 0) / totalVotes) * 100) : 0;
      const noPercentage = 100 - yesPercentage;

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
        creator: 'Prediction Market', // This could come from a separate user API
        category: categoryMap[apiPred.prediction_category_id] || 'General',
        timeAgo: this.calculateTimeAgo(new Date(apiPred.prediction_create_at)),
        participants: apiPred.totalParticipants,
        question: apiPred.prediction_title,
        yesPercentage,
        noPercentage,
        imageUrl: apiPred.prediction_image || undefined,
        sentimentVotes: {
          yes: yesOption?.prediction_intuition_votes || 0,
          no: noOption?.prediction_intuition_votes || 0,
          total: totalVotes
        },
        marketInfo: {
          poolAmount: '$0 USDT', // This would need market data API
          participants: parseInt(apiPred.totalParticipants.replace('K', '000').replace('M', '000000')) || 0,
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

  // Voting state - for demonstration, we'll simulate different voting states
  userVotes: { [predictionIndex: number]: 'yes' | 'no' | null } = {
    0: 'yes', // First prediction has voted YES
    2: 'no',  // Third prediction has voted NO
    // Others are null (not voted)
  };

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

  // Vote on sentiment poll
  vote(predictionIndex: number, option: 'yes' | 'no'): void {
    this.userVotes[predictionIndex] = option;
  }

  // Check if user has voted on a prediction
  hasUserVoted(predictionIndex: number): boolean {
    return this.userVotes[predictionIndex] !== undefined;
  }

  // Get user's vote for a prediction
  getUserVote(predictionIndex: number): 'yes' | 'no' | null {
    return this.userVotes[predictionIndex] || null;
  }

  // Navigate to trade detail page
  navigateToTrade(): void {
    this.router.navigate(['/trade']);
  }
}
