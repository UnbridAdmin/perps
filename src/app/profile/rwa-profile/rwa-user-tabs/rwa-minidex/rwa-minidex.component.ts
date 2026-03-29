import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rwa-minidex',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rwa-minidex.component.html',
  styleUrl: './rwa-minidex.component.scss'
})
export class RwaMinidexComponent {
  @Input() userId?: number;

  rwaTokens = [
    {
      id: 1,
      name: 'Real Estate Token',
      symbol: 'RET',
      price: '$12.45',
      change: '+5.2%',
      positive: true,
      marketCap: '$125.5M',
      volume: '$2.3M'
    },
    {
      id: 2,
      name: 'Green Bond Index',
      symbol: 'GBI',
      price: '$8.90',
      change: '-2.1%',
      positive: false,
      marketCap: '$89.2M',
      volume: '$1.8M'
    },
    {
      id: 3,
      name: 'Infrastructure RWA',
      symbol: 'INFRA',
      price: '$15.67',
      change: '+8.3%',
      positive: true,
      marketCap: '$156.7M',
      volume: '$3.2M'
    },
    {
      id: 4,
      name: 'Commodity Basket',
      symbol: 'COMB',
      price: '$10.20',
      change: '+1.5%',
      positive: true,
      marketCap: '$102M',
      volume: '$900K'
    }
  ];

  constructor() {
    console.log('RwaMinidex: userId:', this.userId);
  }
}
