import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './post-prediction.component.html',
  styleUrls: ['./post-prediction.component.scss']
})
export class PostPredictionComponent {
  @Input() tab: 'for-you' | 'trending' = 'for-you';

  // Popover state
  activeMarketPopover: number | null = null;
  activeSentimentPopover: number | null = null;

  // Voting state - for demonstration, we'll simulate different voting states
  userVotes: { [predictionIndex: number]: 'yes' | 'no' | null } = {
    0: 'yes', // First prediction has voted YES
    2: 'no',  // Third prediction has voted NO
    // Others are null (not voted)
  };

  // Sample data - in a real app, this would come from a service
  private forYouPredictions: Prediction[] = [
    {
      creator: 'PredictMarket',
      category: 'Politics',
      timeAgo: '2h ago',
      participants: '1.2K',
      question: '¿Donald Trump ganará las elecciones de 2028?',
      yesPercentage: 25,
      noPercentage: 75,
      imageUrl: 'https://picsum.photos/600/300?random=1',
      sentimentVotes: {
        yes: 9179,
        no: 3368,
        total: 12547
      },
      marketInfo: {
        poolAmount: '$138,000 USDT',
        participants: 1000,
        options: [
          { label: 'SÍ', amount: '$101K', percentage: 48 },
          { label: 'NO', amount: '$37K', percentage: 52 }
        ]
      },
      actions: {
        comments: 234,
        likes: 456,
        volume: '$138K'
      }
    },
    {
      creator: 'CryptoPredict',
      category: 'Crypto',
      timeAgo: '5h ago',
      participants: '3.4K',
      question: '¿Bitcoin superará los $150K en 2025?',
      yesPercentage: 67,
      noPercentage: 33,
      imageUrl: 'https://picsum.photos/600/300?random=2',
      sentimentVotes: {
        yes: 15420,
        no: 7580,
        total: 23000
      },
      marketInfo: {
        poolAmount: '$250,000 USDT',
        participants: 2300,
        options: [
          { label: 'SÍ', amount: '$167K', percentage: 67 },
          { label: 'NO', amount: '$83K', percentage: 33 }
        ]
      },
      actions: {
        comments: 456,
        likes: 892,
        volume: '$250K'
      }
    },
    {
      creator: 'TechFuture',
      category: 'Tech',
      timeAgo: '8h ago',
      participants: '890',
      question: '¿Apple lanzará un iPhone plegable en 2026?',
      yesPercentage: 34,
      noPercentage: 66,
      imageUrl: 'https://picsum.photos/600/300?random=3',
      sentimentVotes: {
        yes: 4520,
        no: 8740,
        total: 13260
      },
      marketInfo: {
        poolAmount: '$95,000 USDT',
        participants: 890,
        options: [
          { label: 'SÍ', amount: '$32K', percentage: 34 },
          { label: 'NO', amount: '$63K', percentage: 66 }
        ]
      },
      actions: {
        comments: 89,
        likes: 234,
        volume: '$95K'
      }
    }
  ];

  private trendingPredictions: Prediction[] = [
    {
      creator: 'TrendingPredictions',
      category: 'Sports',
      timeAgo: '1h ago',
      participants: '5.2K',
      question: '¿Real Madrid ganará la Champions League 2026?',
      yesPercentage: 72,
      noPercentage: 28,
      imageUrl: 'https://picsum.photos/600/300?random=4',
      sentimentVotes: {
        yes: 18750,
        no: 7250,
        total: 26000
      },
      marketInfo: {
        poolAmount: '$320,000 USDT',
        participants: 5200,
        options: [
          { label: 'SÍ', amount: '$230K', percentage: 72 },
          { label: 'NO', amount: '$90K', percentage: 28 }
        ]
      },
      actions: {
        comments: 892,
        likes: 1245,
        volume: '$320K'
      }
    },
    {
      creator: 'HotTakes',
      category: 'Entertainment',
      timeAgo: '3h ago',
      participants: '2.8K',
      question: '¿Taylor Swift lanzará un nuevo álbum este año?',
      yesPercentage: 89,
      noPercentage: 11,
      imageUrl: 'https://picsum.photos/600/300?random=5',
      sentimentVotes: {
        yes: 22320,
        no: 2680,
        total: 25000
      },
      marketInfo: {
        poolAmount: '$180,000 USDT',
        participants: 2800,
        options: [
          { label: 'SÍ', amount: '$160K', percentage: 89 },
          { label: 'NO', amount: '$20K', percentage: 11 }
        ]
      },
      actions: {
        comments: 567,
        likes: 945,
        volume: '$180K'
      }
    },
    {
      creator: 'MarketWatch',
      category: 'Finance',
      timeAgo: '4h ago',
      participants: '1.9K',
      question: '¿El S&P 500 superará los 6,000 puntos en 2026?',
      yesPercentage: 56,
      noPercentage: 44,
      imageUrl: 'https://picsum.photos/600/300?random=6',
      sentimentVotes: {
        yes: 10640,
        no: 8360,
        total: 19000
      },
      marketInfo: {
        poolAmount: '$145,000 USDT',
        participants: 1900,
        options: [
          { label: 'SÍ', amount: '$81K', percentage: 56 },
          { label: 'NO', amount: '$64K', percentage: 44 }
        ]
      },
      actions: {
        comments: 334,
        likes: 678,
        volume: '$145K'
      }
    }
  ];

  get predictions(): Prediction[] {
    return this.tab === 'for-you' ? this.forYouPredictions : this.trendingPredictions;
  }

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
}
