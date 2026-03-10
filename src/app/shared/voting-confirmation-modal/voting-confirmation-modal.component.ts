import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthorizationService } from '../../services/authorization.service';
import { WalletConnectService } from '../../services/walletconnect.service';
import { ApiServices } from '../../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-voting-confirmation-modal',
  templateUrl: './voting-confirmation-modal.component.html',
  styleUrls: ['./voting-confirmation-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class VotingConfirmationModalComponent implements OnInit {
  @Input() predictionTitle: string = '';
  @Input() optionTitle: string = '';
  isCreatingUser: boolean = false;
  betAmount: number | null = null;

  constructor(
    public activeModal: NgbActiveModal,
    private authorizationService: AuthorizationService,
    private walletConnectService: WalletConnectService,
    private apiService: ApiServices
  ) { }

  ngOnInit(): void {
    // No balance verification required - user can vote freely
  }

  async confirmVote() {
    try {
      // If user is not authenticated, we need to create user account first
      if (!this.authorizationService.isAuthenticated()) {
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

      this.activeModal.close({ confirmed: true, betAmount: this.betAmount || 0 });
    } catch (error) {
      console.error('Error in confirmVote:', error);
      this.isCreatingUser = false;
      // Still close modal to allow vote attempt
      this.activeModal.close({ confirmed: true, betAmount: this.betAmount || 0 });
    }
  }

  cancelVote() {
    this.activeModal.dismiss(false);
  }

  closeModal() {
    this.activeModal.dismiss();
  }
}