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

  // Sample data - in a real app, this would come from a service
  private forYouPredictions: Prediction[] = [
    {
      creator: 'PredictMarket',
      category: 'Politics',
      timeAgo: '2h ago',
      participants: '1.2K',
      question: '¿Donald Trump ganará las elecciones de 2028?',
      yesPercentage: 48,
      noPercentage: 52
    },
    {
      creator: 'CryptoPredict',
      category: 'Crypto',
      timeAgo: '5h ago',
      participants: '3.4K',
      question: '¿Bitcoin superará los $150K en 2025?',
      yesPercentage: 67,
      noPercentage: 33
    },
    {
      creator: 'TechFuture',
      category: 'Tech',
      timeAgo: '8h ago',
      participants: '890',
      question: '¿Apple lanzará un iPhone plegable en 2026?',
      yesPercentage: 34,
      noPercentage: 66
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
      noPercentage: 28
    },
    {
      creator: 'HotTakes',
      category: 'Entertainment',
      timeAgo: '3h ago',
      participants: '2.8K',
      question: '¿Taylor Swift lanzará un nuevo álbum este año?',
      yesPercentage: 89,
      noPercentage: 11
    },
    {
      creator: 'MarketWatch',
      category: 'Finance',
      timeAgo: '4h ago',
      participants: '1.9K',
      question: '¿El S&P 500 superará los 6,000 puntos en 2026?',
      yesPercentage: 56,
      noPercentage: 44
    }
  ];

  get predictions(): Prediction[] {
    return this.tab === 'for-you' ? this.forYouPredictions : this.trendingPredictions;
  }
}
