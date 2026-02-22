import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Signal, Category } from '../shared/models/signal.model';

@Injectable({
    providedIn: 'root'
})
export class SignalsService {
    private mockCategories: Category[] = [
        {
            id: 'sports',
            name: 'Sports',
            icon: 'bx-football',
            children: [
                {
                    id: 'football',
                    name: 'Football',
                    icon: 'bx-trophy',
                    children: [
                        { id: 'la-liga', name: 'La Liga', icon: 'bx-flag' },
                        { id: 'premier-league', name: 'Premier League', icon: 'bx-flag' },
                        { id: 'champions-league', name: 'Champions League', icon: 'bx-star' }
                    ]
                },
                { id: 'basketball', name: 'Basketball', icon: 'bx-basketball' }
            ]
        },
        {
            id: 'financial',
            name: 'Financial',
            icon: 'bx-trending-up',
            children: [
                { id: 'forex', name: 'Forex', icon: 'bx-dollar' },
                { id: 'crypto', name: 'Crypto', icon: 'bx-bitcoin' }
            ]
        }
    ];

    private mockSignals: Signal[] = [
        {
            id: '1',
            title: 'Late Goal Alert',
            type: 'trading',
            status: 'active',
            isLive: true,
            timestamp: new Date(Date.now() - 3 * 60000),
            confidence: 85,
            category: 'sports',
            subCategory: 'football',
            league: 'La Liga · Jornada 30',
            match: 'Real Madrid vs Barcelona',
            minute: 'Minuto 78\'',
            market: 'Total de goles del partido',
            selection: 'OVER 2.5',
            odds: { value: 2.10, format2: '+110' },
            stake: { value: '4/10', percentage: '4% bank' },
            bookmakers: ['Bet365', 'Pinnacle', 'Betway'],
            tipster: { name: 'Guru Goles', handle: 'gurú_goles' },
            note: 'High pressure in final third · Real Madrid volcado, Barcelona solo se defiende. Ocasiones claras.',
            actionUrl: 'https://www.bet365.com',
            estimatedUnits: '+4.4'
        },
        {
            id: '2',
            title: 'Corner Opportunity',
            type: 'trading',
            status: 'pending',
            isLive: false,
            timestamp: new Date(Date.now() - 12 * 60000),
            confidence: 65,
            category: 'sports',
            subCategory: 'football',
            league: 'Premier League',
            match: 'Liverpool vs Arsenal',
            minute: 'Inicio · 16:30',
            market: 'Córners del partido',
            selection: 'OVER 9.5',
            odds: { value: 1.80 },
            stake: { value: '3/10' },
            bookmakers: ['Betfair', 'Unibet', 'William Hill'],
            tipster: { name: 'Corner Pro', handle: 'corner_pro' },
            note: 'Ambos equipos promedian 12 corners por partido. Esperar odds >1.80, salida en vivo.',
            estimatedUnits: '+2.4'
        },
        {
            id: '3',
            title: 'Double Bottom Pattern',
            type: 'technical',
            status: 'active',
            isLive: true,
            timestamp: new Date(),
            confidence: 72,
            category: 'financial',
            subCategory: 'crypto',
            match: 'BTC/USDT',
            pattern: 'Double Bottom',
            action: 'entry',
            strategy: 'Variance Trading System',
            odds: { value: 1.5, format2: 'ROI' },
            stake: { value: '5/10', percentage: '5% bank' },
            bookmakers: ['Binance', 'Bybit'],
            tipster: { name: 'Crypto Whale', handle: 'crypto_whale' },
            note: 'Strong support at 42k. Oversold on RSI.'
        }
    ];

    getCategories(): Observable<Category[]> {
        return of(this.mockCategories);
    }

    getSignals(categoryId?: string, subCategoryId?: string): Observable<Signal[]> {
        let signals = this.mockSignals;
        if (subCategoryId) {
            signals = signals.filter(s => s.subCategory === subCategoryId || s.league?.includes(subCategoryId));
        } else if (categoryId) {
            signals = signals.filter(s => s.category === categoryId);
        }
        return of(signals);
    }
}
