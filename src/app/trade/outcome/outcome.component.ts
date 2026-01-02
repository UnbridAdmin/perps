import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphComponent } from '../graph/graph.component';
import { OrderBookComponent } from '../order-book/order-book.component';
import { ResolutionComponent } from '../resolution/resolution.component';

@Component({
  selector: 'app-outcome',
  standalone: true,
  imports: [CommonModule, GraphComponent, OrderBookComponent, ResolutionComponent],
  templateUrl: './outcome.component.html',
  styleUrl: './outcome.component.scss',
})
export class OutcomeComponent {
  outcomes = [
    { id: 'jan9', date: 'January 9', volume: '$14,832 Vol.', percentage: 7, change: -12, expanded: true },
    { id: 'jan15', date: 'January 15', volume: '$42,404 Vol.', percentage: 25, change: -42, expanded: false },
    { id: 'jan31', date: 'January 31', volume: '$12,399 Vol.', percentage: 87, change: 6, expanded: false },
    { id: 'apr20', date: 'April 20', volume: '$3,841 Vol.', percentage: 98, change: 0, expanded: false }
  ];

  activeTab: { [key: string]: string } = {
    jan9: 'orderbook',
    jan15: 'orderbook',
    jan31: 'orderbook',
    apr20: 'orderbook'
  };

  toggleOutcome(outcomeId: string) {
    const outcome = this.outcomes.find(o => o.id === outcomeId);
    if (outcome) {
      if (outcome.expanded) {
        outcome.expanded = false;
      } else {
        this.outcomes.forEach(o => o.expanded = false);
        outcome.expanded = true;
      }
    }
  }

  switchTab(outcomeId: string, tabName: string) {
    this.activeTab[outcomeId] = tabName;
  }
}
