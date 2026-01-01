import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent {
  newsItems = [
    {
      category: 'Crypto',
      title: 'Bitcoin reaches new all-time high',
      time: '2h ago'
    },
    {
      category: 'Politics',
      title: 'Election results surprise analysts',
      time: '4h ago'
    },
    {
      category: 'Sports',
      title: 'Championship finals set for next week',
      time: '6h ago'
    },
    {
      category: 'Tech',
      title: 'New AI breakthrough announced',
      time: '8h ago'
    }
  ];

  trendingTopics = [
    { name: '#Bitcoin', posts: '125K' },
    { name: '#Elections2024', posts: '89K' },
    { name: '#AI', posts: '67K' },
    { name: '#Sports', posts: '45K' }
  ];
}
