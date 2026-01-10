import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-voting-confirmation-modal',
  templateUrl: './voting-confirmation-modal.component.html',
  styleUrls: ['./voting-confirmation-modal.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class VotingConfirmationModalComponent implements OnInit {
  @Input() predictionTitle: string = '';
  @Input() optionTitle: string = '';
  @Input() hasFierceBalance: boolean = false;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void { }

  confirmVote() {
    this.activeModal.close(true);
  }

  cancelVote() {
    this.activeModal.dismiss(false);
  }

  goToTelegram() {
    window.open('https://t.me/fierce_guardian_bot', '_blank');
  }

  closeModal() {
    this.activeModal.dismiss();
  }
}