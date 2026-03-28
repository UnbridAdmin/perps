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
            const votes = option.votes !== undefined ? option.votes : (option.prediction_intuition_votes || 0);
            return sum + votes;
        }, 0);
    }

    get visibleOptions() {
        if (!this.prediction?.options) return [];
        const total = this.totalVotes;

        // Map options with calculated percentages
        const mappedOptions = this.prediction.options.map((option: any) => {
            const votes = option.votes !== undefined ? option.votes : (option.prediction_intuition_votes || 0);
            return {
                ...option,
                id: option.prediction_option_id || option.id,
                title: option.prediction_option_title || option.title,
                percentage: total > 0 ? Math.round((votes / total) * 100) : 0
            };
        });

        // Sort by percentage descending (highest first)
        const sortedOptions = mappedOptions.sort((a: any, b: any) => b.percentage - a.percentage);

        // Return only visible options based on showAllOptions state
        return this.showAllOptions ? sortedOptions : sortedOptions.slice(0, 3);
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
