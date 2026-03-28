import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-trading-market',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './trading-market.component.html',
    styleUrls: ['./trading-market.component.scss']
})
export class TradingMarketComponent {
    @Input() prediction: any;
    @Output() trade = new EventEmitter<void>();
    @Output() close = new EventEmitter<void>();

    onTrade() {
        this.trade.emit();
    }

    onClose() {
        this.close.emit();
    }

    get sortedOptions(): any[] {
        // Handle different data structures
        // Backend already sorts by percentage (highest to lowest), no need to sort here
        if (this.prediction?.marketInfo?.options && Array.isArray(this.prediction.marketInfo.options)) {
            return this.prediction.marketInfo.options;
        } else if (this.prediction?.options && Array.isArray(this.prediction.options)) {
            return this.prediction.options;
        } else if (this.prediction?.data?.options && Array.isArray(this.prediction.data.options)) {
            return this.prediction.data.options;
        }

        return [];
    }
}
