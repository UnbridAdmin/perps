import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthorizationService } from '../../services/authorization.service';
import { WalletConnectService } from '../../services/walletconnect.service';
import { environment } from '../../../environments/environment';

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
  isCheckingBalance: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private authorizationService: AuthorizationService,
    private walletConnectService: WalletConnectService
  ) { }

  ngOnInit(): void {
    if (!this.authorizationService.isAuthenticated()) {
      this.checkFierceBalance();
    }
  }

  async checkFierceBalance() {
    this.isCheckingBalance = true;
    try {
      const balance = await this.walletConnectService.getERC20Balance(
        environment.DECIMALFIERCE,
        environment.FIERCECONTRACTADDRESS,
        environment.USDTPolyABI
      );
      if (balance) {
        const balanceNumber = parseFloat(balance);
        this.hasFierceBalance = balanceNumber > 0;
      } else {
        this.hasFierceBalance = false;
      }
    } catch (error) {
      console.error('Error checking Fierce balance:', error);
      this.hasFierceBalance = false;
    } finally {
      this.isCheckingBalance = false;
    }
  }

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