import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent {
  activeTab: 'intuition' | 'pool' | 'trading' = 'intuition';
  searchQuery: string = '';

  activities = [
    {
      type: 'Bought',
      market: 'Will Trump admin release any more Epstein related files by Jan...',
      option: 'Yes 48¢',
      shares: '2.1 shares',
      value: -1.00,
      time: '2mo ago',
      image: 'https://api.dicebear.com/9.x/fun-emoji/svg'
    },
    {
      type: 'Deposited',
      market: 'Deposited funds',
      value: 5.00,
      time: '2mo ago',
      icon: 'bx-dollar-circle'
    }
  ];

  setTab(tab: 'intuition' | 'pool' | 'trading') {
    this.activeTab = tab;
  }
}
