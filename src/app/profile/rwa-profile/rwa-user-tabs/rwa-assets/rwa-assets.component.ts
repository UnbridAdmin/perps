import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rwa-assets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rwa-assets.component.html',
  styleUrl: './rwa-assets.component.scss'
})
export class RwaAssetsComponent {
  @Input() userId?: number;

  assets = [
    {
      id: 1,
      name: 'Real Estate Portfolio A',
      symbol: 'RET-A',
      value: '$125,500',
      shares: '1,000',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Green Energy Fund',
      symbol: 'GEF-01',
      value: '$85,250',
      shares: '500',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Infrastructure Bonds',
      symbol: 'INB-02',
      value: '$45,000',
      shares: '250',
      status: 'Pending'
    }
  ];

  constructor() {
    console.log('RwaAssets: userId:', this.userId);
  }
}
