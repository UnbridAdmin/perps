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
    betAmount: number = 1;
    potentialProfit: number = 0;

    onSelectOption(optionId: number) {
        if (this.selectedOptionId === optionId) {
            // Toggle: si la opción ya está seleccionada, colapsar
            this.selectedOptionId = null;
            this.potentialProfit = 0;
        } else {
            this.selectedOptionId = optionId;
            this.calculatePotentialProfit();
        }
    }

    onAmountChange() {
        this.calculatePotentialProfit();
    }

    calculatePotentialProfit() {
        if (this.selectedOptionId === null || !this.betAmount || this.betAmount <= 0) {
            this.potentialProfit = 0;
            return;
        }

        const optionsList = this.prediction?.options || [];
        const selectedOption = optionsList.find((o: any) => (o.prediction_option_id || o.id) === this.selectedOptionId);
        if (!selectedOption) return;

        // Get values from prediction object
        const poolAmount = parseFloat(this.prediction.marketInfo?.poolAmount?.replace(/[^0-9.]/g, '') || '0');
        const percentage = selectedOption.poolPercentage !== undefined ? selectedOption.poolPercentage : (selectedOption.percentage || 0);
        const optionPool = parseFloat(selectedOption.poolAmount?.toString().replace(/[^0-9.]/g, '') || (poolAmount * (percentage / 100)).toString());
        const userInvestment = selectedOption.userInvestment || 0;

        const newOptionPool = optionPool + this.betAmount;
        const newTotalPool = poolAmount + this.betAmount;

        // Porcentaje a repartir (100% - burn - fee). Por defecto 70%
        const betBurn = this.prediction.betBurn !== undefined ? parseFloat(this.prediction.betBurn) : 5;
        const betFee = this.prediction.betPlatformRewards !== undefined ? parseFloat(this.prediction.betPlatformRewards) : 25;
        const rewardMultiplier = Math.max(0, 100 - betBurn - betFee) / 100;

        const distributablePool = newTotalPool * rewardMultiplier;

        const userShare = (userInvestment + this.betAmount) / newOptionPool;

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

    getPoolAmountWithoutUnit(): string {
        const poolAmount = this.prediction.marketInfo?.poolAmount || '0';
        return poolAmount.replace(/[^0-9.]/g, '');
    }

    formatPercentage(value: number): string {
        return Math.round(value * 100) / 100 + '';
    }
}
