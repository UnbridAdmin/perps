import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-you-won',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './you-won.component.html',
  styleUrls: ['./you-won.component.scss']
})
export class YouWonComponent {
  @Input() amount: number = 2.08;
  @Input() marketTitle: string = 'Will Trump admin release any more Epstein related files by Jan...';
  @Input() marketImage: string = 'https://api.dicebear.com/9.x/fun-emoji/svg';

  onClaim() {
    console.log('Claiming', this.amount);
  }
}
