import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradingHistoryService } from './trading-history.service';

@Component({
  selector: 'app-trading-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trading-history.component.html',
  styleUrls: ['./trading-history.component.scss']
})
export class TradingHistoryComponent implements OnInit {
  history: any[] = [];
  loading = true;
  page = 1;
  pageSize = 20;
  hasMore = true;

  constructor(private historyService: TradingHistoryService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(append = false): void {
    this.loading = true;
    this.historyService.getUserMarketHistory(this.page, this.pageSize).subscribe({
      next: (res: any) => {
        if (res.status === 200) {
          const newData = res.data || [];
          if (append) {
            this.history = [...this.history, ...newData];
          } else {
            this.history = newData;
          }
          this.hasMore = newData.length === this.pageSize;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading history:', err);
        this.loading = false;
      }
    });
  }

  loadMore(): void {
    if (this.hasMore && !this.loading) {
      this.page++;
      this.loadHistory(true);
    }
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMonths > 0) return `${diffMonths}mo ago`;
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHr > 0) return `${diffHr}h ago`;
    if (diffMin > 0) return `${diffMin}m ago`;
    return 'Just now';
  }

  getValueClass(value: number): string {
    return value < 0 ? 'negative' : 'positive';
  }

  formatValue(value: number): string {
    const absValue = Math.abs(value).toFixed(2);
    return value < 0 ? `-$${absValue}` : `+$${absValue}`;
  }
}
