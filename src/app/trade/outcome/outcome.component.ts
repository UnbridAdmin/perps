import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
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
  option_multiple_id: number;
  change: number;
  avg_buy_price: number;
  prediction_option_image: string | null;
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
  @Input() isBuyMode: boolean = true;
  @Output() onSelectOption = new EventEmitter<any>();

  outcomes: any[] = [];

  activeTab: { [key: string]: string } = {};

  constructor(private tradeService: TradeService) { }

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
          volume: `Vol.${option.volume.toFixed(2)} Fierce`,
          percentage: Math.round(option.percentage),
          change: option.change || 0, // Use real change from backend
          expanded: false, // Will be set after sorting
          optionData: option // Keep original option data for further use
        };
      });

      // Sort outcomes by percentage in descending order (highest first)
      this.outcomes.sort((a, b) => b.percentage - a.percentage);

      // Expand the first option after sorting (highest percentage)
      if (this.outcomes.length > 0) {
        this.outcomes[0].expanded = true;
      }

      // Initialize active tabs for each outcome
      this.activeTab = {};
      this.outcomes.forEach(outcome => {
        this.activeTab[outcome.id] = 'graph'; // Default to graph tab
      });
    }
  }

  toggleOutcome(outcomeId: string, side?: 'yes' | 'no') {
    const outcome = this.outcomes.find(o => o.id === outcomeId);
    if (outcome) {
      if (outcome.expanded && !side) {
        outcome.expanded = false;
      } else {
        this.outcomes.forEach(o => o.expanded = false);
        outcome.expanded = true;
        this.onSelectOption.emit({ optionData: outcome.optionData, side: side || 'yes', isBuyMode: this.isBuyMode });
      }
    }
  }

  buyOption(event: Event, optionData: any, side: 'yes' | 'no') {
    event.stopPropagation();
    const id = `option_${optionData.option_id}`;
    this.toggleOutcome(id, side);
  }

  switchTab(outcomeId: string, tabName: string) {
    this.activeTab[outcomeId] = tabName;
  }
}
