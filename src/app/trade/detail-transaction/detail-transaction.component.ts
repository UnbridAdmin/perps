import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommentsComponent } from '../comments/comments.component';

@Component({
    selector: 'app-detail-transaction',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './detail-transaction.component.html',
    styleUrl: './detail-transaction.component.scss'
})
export class DetailTransactionComponent {
    @Input() predictionTitle: string = '';
    @Input() optionTitle: string = '';
    @Input() amount: number = 0;
    @Input() isBuyMode: boolean = true;
    @Input() price: number = 0;
    @Input() potentialReturn: number = 0; // profit for buy, proceeds for sell
    @Input() predictionId: string = '';

    constructor(private activeModal: NgbActiveModal) { }

    closeModal() {
        this.activeModal.dismiss();
    }

    cancelTransaction() {
        this.activeModal.close(false);
    }

    confirmTransaction() {
        this.activeModal.close(true);
    }
}
