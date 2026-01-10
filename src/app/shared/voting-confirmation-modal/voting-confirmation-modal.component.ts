import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthorizationService } from '../../services/authorization.service';
import { WalletConnectService } from '../../services/walletconnect.service';
import { ApiServices } from '../../services/api.service';
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
  isCreatingUser: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private authorizationService: AuthorizationService,
    private walletConnectService: WalletConnectService,
    private apiService: ApiServices
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

  async confirmVote() {
    try {
      // If user is not authenticated but has Fierce balance, we need to create user account first
      if (!this.authorizationService.isAuthenticated() && this.hasFierceBalance) {
        this.isCreatingUser = true;

        const walletAddress = await this.walletConnectService.getConnectedWalletAddress();

        // Generate message to sign
        const message = `Click to sign in and accept the Unbrid Terms of Service(https://unbrid.com/privacy-policy). Login with secure code: ${Date.now()}`;

        // Request signature
        const signatureData = await this.walletConnectService.signMessage(message);

        // Create user request payload
        const createUserRequest = {
          address: walletAddress,
          coin_id: 1, // Assuming 1 is the default coin_id for Polygon
          message: signatureData.message,
          signature: signatureData.signature,
          referral_code: '' // Optional
        };

        // Call secure-create-user endpoint
        const createUserResponse = await this.apiService.publicApiCall('user/secure-create-user', 'POST', createUserRequest).toPromise() as any;

        if (createUserResponse?.data?.success) {
          // User created successfully and token should be set via cookies/interceptors
          console.log('User created successfully');
        } else {
          console.error('Failed to create user:', createUserResponse);
          // Still proceed with vote attempt - the API might handle it
        }

        this.isCreatingUser = false;
      }

      this.activeModal.close(true);
    } catch (error) {
      console.error('Error in confirmVote:', error);
      this.isCreatingUser = false;
      // Still close modal to allow vote attempt
      this.activeModal.close(true);
    }
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