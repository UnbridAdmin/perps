import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profit-loss',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profit-loss.component.html',
  styleUrls: ['./profit-loss.component.scss']
})
export class ProfitLossComponent implements OnInit {
  @Input() totalPL: number = 0;
  @Input() timeRange: string = '1M';
  
  ranges = ['1D', '1W', '1M', 'ALL'];

  ngOnInit() {
    // Initial logic if needed
  }

  setRange(range: string) {
    this.timeRange = range;
  }
}
