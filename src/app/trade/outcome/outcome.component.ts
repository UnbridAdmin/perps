import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphComponent } from '../graph/graph.component';
import { OrderBookComponent } from '../order-book/order-book.component';
import { ResolutionComponent } from '../resolution/resolution.component';

@Component({
  selector: 'app-outcome',
  standalone: true,
  imports: [CommonModule, GraphComponent, ResolutionComponent],
  templateUrl: './outcome.component.html',
  styleUrl: './outcome.component.scss',
})
export class OutcomeComponent {
  Math = Math;

  outcomes = [
    { id: 'camila', date: 'Camila', volume: '$120,832 Vol.', percentage: 45, change: -3, expanded: true },
    { id: 'andres', date: 'Andrés', volume: '$80,404 Vol.', percentage: 30, change: 5, expanded: false },
    { id: 'alexandra', date: 'Alexandra', volume: '$45,399 Vol.', percentage: 15, change: -2, expanded: false },
    { id: 'samuel', date: 'Samuel', volume: '$20,841 Vol.', percentage: 10, change: 0, expanded: false }
  ];

  activeTab: { [key: string]: string } = {
    camila: 'orderbook',
    andres: 'orderbook',
    alexandra: 'orderbook',
    samuel: 'orderbook'
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
