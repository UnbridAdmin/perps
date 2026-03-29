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
    @Input() bParam: number = 10;
    @Input() feeRate: number = 0.01;
    @Output() trade = new EventEmitter<void>();
    @Output() close = new EventEmitter<void>();

    // AMM pricing parameters
    private amount: number = 1;
    private isBuyMode: boolean = true;

    onTrade() {
        this.trade.emit();
    }

    // Calculate effective price using AMM logic
    calculateEffectivePrice(spotPrice: number): number {
        const feeFactor = 1 - this.feeRate;

        if (this.isBuyMode) {
            const net = this.amount * feeFactor;
            const impact = (1 - spotPrice) * (net / this.bParam);
            const endPrice = Math.min(0.999, spotPrice + impact);
            const avgPrice = (spotPrice + endPrice) / 2;
            return Math.min(0.999, avgPrice / feeFactor);
        } else {
            const shares = this.amount;
            const impact = spotPrice * (shares / this.bParam);
            const endPrice = Math.max(0.001, spotPrice - impact);
            const avgPrice = (spotPrice + endPrice) / 2;
            return Math.max(0.001, avgPrice * feeFactor);
        }
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

    // Get effective price for an option
    getEffectivePrice(option: any): number {
        // Priority: 1. Backend-provided dynamic price
        if (this.isBuyMode && option.buy_price) return Number(option.buy_price);
        if (!this.isBuyMode && option.sell_price) return Number(option.sell_price);

        // 2. Manual AMM math fallback
        const spotPrice = option.price || 0.5;
        return this.calculateEffectivePrice(spotPrice);
    }
}
