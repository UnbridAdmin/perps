import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-bet-pool',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './bet-pool.component.html',
    styleUrls: ['./bet-pool.component.scss']
})
export class BetPoolComponent {
    @Input() prediction: any;
    @Output() vote = new EventEmitter<number>();
    @Output() close = new EventEmitter<void>();

    onVote(optionId: number) {
        this.vote.emit(optionId);
    }

    onClose() {
        this.close.emit();
    }
}
