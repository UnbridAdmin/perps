import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Signal, TradingSignal, TechnicalSignal } from '../../../shared/models/signal.model';

@Component({
    selector: 'app-signal-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './signal-card.component.html',
    styleUrl: './signal-card.component.scss'
})
export class SignalCardComponent {
    @Input() signal!: Signal;

    get tradingSignal(): TradingSignal {
        return this.signal as TradingSignal;
    }

    get technicalSignal(): TechnicalSignal {
        return this.signal as TechnicalSignal;
    }

    get signalValue(): string {
        if (this.signal.type === 'trading') {
            return (this.signal as TradingSignal).selection;
        } else {
            return (this.signal as TechnicalSignal).pattern || (this.signal as TechnicalSignal).action;
        }
    }

    get signalMarket(): string {
        if (this.signal.type === 'trading') {
            return (this.signal as TradingSignal).market;
        } else {
            return (this.signal as TechnicalSignal).strategy;
        }
    }

    get signalAction(): string {
        if (this.signal.type === 'technical') {
            return (this.signal as TechnicalSignal).action;
        }
        return 'trading';
    }

    getTimeAgo(date: Date): string {
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

        if (diffInMinutes < 1) return 'ahora';
        if (diffInMinutes < 60) return `${diffInMinutes} min`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} h`;

        return `${Math.floor(diffInHours / 24)} d`;
    }
}
