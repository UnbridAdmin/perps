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
        let options: any[] = [];

        if (this.prediction?.marketInfo?.options && Array.isArray(this.prediction.marketInfo.options)) {
            options = this.prediction.marketInfo.options;
        } else if (this.prediction?.options && Array.isArray(this.prediction.options)) {
            options = this.prediction.options;
        } else if (this.prediction?.data?.options && Array.isArray(this.prediction.data.options)) {
            options = this.prediction.data.options;
        }

        if (options.length === 0) {
            return [];
        }

        return [...options].sort((a: any, b: any) => {
            const percentageA = a.percentage || a.poolPercentage || 0;
            const percentageB = b.percentage || b.poolPercentage || 0;
            return percentageB - percentageA;
        });
    }
}
