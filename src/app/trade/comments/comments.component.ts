import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Comment {
  id: number;
  author: string;
  username: string;
  timeAgo: string;
  content: string;
  likes: number;
  replies: number;
}

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss',
})
export class CommentsComponent {
  comments: Comment[] = [
    {
      id: 1,
      author: 'CryptoTrader',
      username: '@cryptotrader',
      timeAgo: '2h',
      content: 'Creo que Grok 4.20 será lanzado antes de lo esperado. Elon siempre sorprende con sus anuncios.',
      likes: 24,
      replies: 3
    },
    {
      id: 2,
      author: 'TechAnalyst',
      username: '@techanalyst',
      timeAgo: '4h',
      content: 'Las probabilidades están muy bajas para January 9. Podría ser una buena oportunidad de compra.',
      likes: 18,
      replies: 5
    },
    {
      id: 3,
      author: 'MarketWatch',
      username: '@marketwatch',
      timeAgo: '6h',
      content: 'El volumen de trading ha aumentado significativamente en las últimas 24h. Interesante movimiento.',
      likes: 42,
      replies: 8
    }
  ];
}
