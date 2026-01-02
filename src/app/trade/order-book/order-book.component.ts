import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-book',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-book.component.html',
  styleUrl: './order-book.component.scss',
})
export class OrderBookComponent {
  asks = [
    { price: 11, shares: '712.50', total: '275.87' },
    { price: 10, shares: '1,020.00', total: '197.49' },
    { price: 9, shares: '874.32', total: '95.49' },
    { price: 8, shares: '210.00', total: '16.80' }
  ];

  bids = [
    { price: 6, shares: '206.77', total: '12.41' }
  ];

  spread = 2;
}
