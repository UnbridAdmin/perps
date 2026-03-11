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

    get visibleOptions() {
        if (!this.prediction?.options) return [];
        return this.showAllOptions ? this.prediction.options : this.prediction.options.slice(0, 3);
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
