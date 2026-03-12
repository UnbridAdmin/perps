import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-bet-pool',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './bet-pool.component.html',
    styleUrls: ['./bet-pool.component.scss']
})
export class BetPoolComponent {
    @Input() prediction: any;
    @Output() vote = new EventEmitter<{ optionId: number, amount: number }>();
    @Output() close = new EventEmitter<void>();

    selectedOptionId: number | null = null;
    betAmount: number = 10;
    potentialProfit: number = 0;
    burnRate: number = 0.05; // 5% configurable

    onSelectOption(optionId: number) {
        this.selectedOptionId = optionId;
        this.calculatePotentialProfit();
    }

    onAmountChange() {
        this.calculatePotentialProfit();
    }

    calculatePotentialProfit() {
        if (this.selectedOptionId === null || !this.betAmount || this.betAmount <= 0) {
            this.potentialProfit = 0;
            return;
        }

        const selectedOption = this.prediction.options.find((o: any) => o.id === this.selectedOptionId);
        if (!selectedOption) return;

        // Mocking values if they don't exist in the current prediction object
        const poolAmount = parseFloat(this.prediction.marketInfo?.poolAmount?.replace(/[^0-9.]/g, '') || '0');
        const optionPool = parseFloat(selectedOption.poolAmount?.toString().replace(/[^0-9.]/g, '') || (poolAmount * (selectedOption.percentage / 100)).toString());
        const userInvestment = selectedOption.userInvestment || 0;

        const newOptionPool = optionPool + this.betAmount;
        const newTotalPool = poolAmount + this.betAmount;
        
        const userShare = (userInvestment + this.betAmount) / newOptionPool;
        const distributablePool = newTotalPool * (1 - this.burnRate);
        
        const estimatedPayout = userShare * distributablePool;
        this.potentialProfit = estimatedPayout - (userInvestment + this.betAmount);
    }

    onConfirmVote() {
        if (this.selectedOptionId && this.betAmount > 0) {
            this.vote.emit({ 
                optionId: this.selectedOptionId, 
                amount: this.betAmount 
            });
        }
    }

    onClose() {
        this.close.emit();
    }
}
