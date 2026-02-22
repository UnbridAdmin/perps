export type SignalType = 'trading' | 'technical';
export type SignalStatus = 'active' | 'pending' | 'completed' | 'expired';

export interface Odds {
    value: number;
    format2?: string; // e.g., American format "+110"
}

export interface Stake {
    value: string; // e.g., "4/10"
    percentage?: string; // e.g., "4% bank"
}

export interface Tipster {
    name: string;
    handle: string;
    avatar?: string;
}

export interface BaseSignal {
    id: string;
    title: string;
    type: SignalType;
    status: SignalStatus;
    timestamp: Date;
    confidence: number;
    category: string;
    subCategory?: string;
    league?: string;
    match: string;
    isLive: boolean;
    minute?: string;
    odds: Odds;
    stake: Stake;
    bookmakers: string[];
    tipster: Tipster;
    note?: string;
    actionUrl?: string;
    estimatedUnits?: string;
}

export interface TradingSignal extends BaseSignal {
    type: 'trading';
    market: string;
    selection: string;
}

export interface TechnicalSignal extends BaseSignal {
    type: 'technical';
    pattern: string;
    action: 'buy' | 'sell' | 'hold' | 'entry' | 'exit';
    strategy: string;
}

export type Signal = TradingSignal | TechnicalSignal;

export interface Category {
    id: string;
    name: string;
    icon: string;
    children?: Category[];
}
