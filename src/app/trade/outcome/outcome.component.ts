import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphComponent } from '../graph/graph.component';
import { OrderBookComponent } from '../order-book/order-book.component';
import { ResolutionComponent } from '../resolution/resolution.component';
import { TradeService } from '../trade.service';

interface TradeOptionData {
  option_id: number;
  option_title: string;
  price: number;
  volume: number;
  percentage: number;
  resolution: string;
  user_shares: number;
}

@Component({
  selector: 'app-outcome',
  standalone: true,
  imports: [CommonModule, GraphComponent, ResolutionComponent],
  templateUrl: './outcome.component.html',
  styleUrl: './outcome.component.scss',
})
export class OutcomeComponent implements OnInit, OnChanges {
  Math = Math;

  @Input() tradeData: any = null;

  outcomes: any[] = [];

  activeTab: { [key: string]: string } = {};

  constructor(private tradeService: TradeService) {}

  ngOnInit() {
    this.mapOptionsToOutcomes();
  }

  ngOnChanges() {
    this.mapOptionsToOutcomes();
  }

  private mapOptionsToOutcomes() {
    if (this.tradeData?.options && Array.isArray(this.tradeData.options)) {
      this.outcomes = this.tradeData.options.map((option: TradeOptionData, index: number) => {
        const id = `option_${option.option_id}`;
        return {
          id: id,
          date: option.option_title,
          volume: `$${option.volume.toFixed(2)} Vol.`,
          percentage: Math.round(option.percentage),
          change: 0, // For now, set to 0. Could be calculated based on price changes
          expanded: index === 0, // Expand first option by default
          optionData: option // Keep original option data for further use
        };
      });

      // Initialize active tabs for each outcome
      this.activeTab = {};
      this.outcomes.forEach(outcome => {
        this.activeTab[outcome.id] = 'graph'; // Default to graph tab
      });
    }
  }

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
