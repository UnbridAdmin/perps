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
}
