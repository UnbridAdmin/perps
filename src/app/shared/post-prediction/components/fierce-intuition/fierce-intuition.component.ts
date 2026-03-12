import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-fierce-intuition',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './fierce-intuition.component.html',
    styleUrls: ['./fierce-intuition.component.scss']
})
export class FierceIntuitionComponent {
    @Input() prediction: any;
    @Input() hasVoted: boolean = false;
    @Input() votedOptionId: number | null = null;
    @Output() vote = new EventEmitter<number>();
    @Output() showHowItWorks = new EventEmitter<void>();

    showAllOptions = false;

    get totalVotes(): number {
        if (!this.prediction?.options) return 0;
        return this.prediction.options.reduce((sum: number, option: any) => {
            return sum + (option.prediction_intuition_votes || 0);
        }, 0);
    }

    get visibleOptions() {
        if (!this.prediction?.options) return [];
        const options = this.showAllOptions ? this.prediction.options : this.prediction.options.slice(0, 3);
        const total = this.totalVotes;
        
        return options.map((option: any) => ({
            ...option,
            percentage: total > 0 ? Math.round((option.prediction_intuition_votes / total) * 100) : 0
        }));
    }

    get remainingOptionsCount() {
        if (!this.prediction?.options) return 0;
        return Math.max(0, this.prediction.options.length - 3);
    }

    onVote(optionId: number) {
        this.vote.emit(optionId);
    }

    onShowHowItWorks() {
        this.showHowItWorks.emit();
    }
}
