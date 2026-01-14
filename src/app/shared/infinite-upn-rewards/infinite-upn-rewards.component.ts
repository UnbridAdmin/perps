import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-infinite-upn-rewards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './infinite-upn-rewards.component.html',
  styleUrls: ['./infinite-upn-rewards.component.scss']
})
export class InfiniteUpnRewardsComponent {
  constructor(public activeModal: NgbActiveModal) {}

  closeDialog() {
    this.activeModal.close();
  }
}
