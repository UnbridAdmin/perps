import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TradeService } from '../trade.service';
import { AuthorizationService } from '../../services/authorization.service';
import moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DetailTransactionComponent } from '../detail-transaction/detail-transaction.component';
import { WalletConnectService } from '../../services/walletconnect.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-trading-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trading-panel.component.html',
  styleUrl: './trading-panel.component.scss',
})
export class TradingPanelComponent implements OnInit {
  @Input() optionData: any = null;
  @Input() userBalance: number = 0;
  @Input() predictionTitle: string = '';
  @Input() predictionType: string = 'MULTIPLE';
  @Input() options: any[] = [];

  isBuyMode = true;
  selectedOption: 'yes' | 'no' = 'yes';
  amount = 1;
  sharesToSell = 0;
  maxAmount = 0;

  yesPrice = 0;
  noPrice = 0;
  avgPrice = 0;

  isLoading = false;

  constructor(
    private tradeService: TradeService,
    private authService: AuthorizationService,
    private walletConnectService: WalletConnectService,
    private confirmDialogService: ConfirmDialogService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.updateFromOptionData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['optionData'] && this.predictionType === 'BINARY' && this.optionData) {
      const title = this.optionData.option_title?.toUpperCase();
      if (title === 'YES') this.selectedOption = 'yes';
      else if (title === 'NO') this.selectedOption = 'no';
    }

    if (changes['optionData'] || changes['userBalance'] || changes['predictionTitle'] || changes['options'] || changes['predictionType']) {
      this.updateFromOptionData();
    }
  }

  private updateFromOptionData() {
    // 1. Logic for BINARY predictions
    if (this.predictionType?.toUpperCase() === 'BINARY' && this.options && this.options.length > 0) {
      const yesOption = this.options.find(o => o.option_title?.toUpperCase() === 'YES');
      const noOption = this.options.find(o => o.option_title?.toUpperCase() === 'NO');

      // Set button prices
      if (yesOption) this.yesPrice = Number(yesOption.price) || 0;
      if (noOption) this.noPrice = Number(noOption.price) || 0;

      // Extract data for the selected side
      const selectedObj = this.selectedOption === 'yes' ? yesOption : noOption;
      
      if (selectedObj) {
        this.predictionOptionId = selectedObj.option_multiple_id;
        if (this.selectedOption === 'yes') {
          this.userShares = Number(selectedObj.user_shares_yes) || 0;
          this.avgPrice = Number(selectedObj.avg_buy_price_yes) || selectedObj.price;
        } else {
          this.userShares = Number(selectedObj.user_shares_no) || 0;
          this.avgPrice = Number(selectedObj.avg_buy_price_no) || selectedObj.price;
        }
      }
    }
    // 2. Logic for MULTIPLE predictions
    else if (this.optionData) {
      this.yesPrice = Number(this.optionData.price) || 0;
      this.noPrice = Number((1 - this.yesPrice).toFixed(3));
      this.avgPrice = Number(this.optionData.avg_buy_price) || this.yesPrice;
      this.userShares = Number(this.optionData.user_shares) || 0;
      this.predictionOptionId = this.optionData.option_multiple_id;
    }

    // 3. Forced synchronization for SELL mode
    if (!this.isBuyMode) {
      this.sharesToSell = this.userShares;
    } else if (this.sharesToSell > this.userShares) {
      this.sharesToSell = this.userShares;
    }

    // 4. Update limits
    if (this.userBalance >= 0) {
      this.maxAmount = this.userBalance;
      if (this.amount > this.maxAmount && this.maxAmount > 0) {
        this.amount = this.maxAmount;
      }
    }
  }

  toggleMode(buyMode: boolean) {
    this.isBuyMode = buyMode;
    this.updateFromOptionData();

    // When switching to SELL mode, auto-load shares
    if (!buyMode) {
      this.sharesToSell = this.userShares;
    }
  }

  selectOption(option: 'yes' | 'no') {
    this.selectedOption = option;
    this.updateFromOptionData();

    // In SELL mode for BINARY predictions, auto-load the shares for the selected option
    if (!this.isBuyMode && this.predictionType?.toUpperCase() === 'BINARY') {
      this.sharesToSell = this.userShares;
    }
  }

  predictionOptionId: number = 0;
  userShares: number = 0;
  Math = Math;

  async checkWalletConnection(): Promise<boolean> {
    const isConnected = await this.walletConnectService.checkConnection();
    if (!isConnected) {
      await this.confirmDialogService.showInfo({
        title: 'Billetera requerida',
        message1: 'Debes conectar tu billetera para votar en las predicciones.'
      });
      return false;
    }
    return true;
  }

  get toWin(): number {
    const price = this.selectedOption === 'yes' ? this.yesPrice : this.noPrice;
    if (!price || !this.amount) return 0;
    // (Amount / Price) = Total Tokens if Win. 
    // Potential Profit = Total Tokens - Amount
    const profit = (Number(this.amount) / price) - Number(this.amount);
    return parseFloat(profit.toFixed(2));
  }

  get potentialProceeds(): number {
    const price = this.selectedOption === 'yes' ? this.yesPrice : this.noPrice;
    if (!price || !this.sharesToSell) return 0;
    return parseFloat((Number(this.sharesToSell) * price).toFixed(2));
  }

  async setAmount(value: number) {
    if (!await this.checkWalletConnection()) return;
    this.amount = Math.min(this.amount + value, this.maxAmount);
  }

  async setMaxAmount() {
    if (!await this.checkWalletConnection()) return;
    this.amount = this.maxAmount;
  }

  async setSharesToSell(value: number) {
    if (!await this.checkWalletConnection()) return;
    this.sharesToSell = Math.min(this.sharesToSell + value, this.userShares);
  }

  async setAllSharesToSell() {
    if (!await this.checkWalletConnection()) return;
    this.sharesToSell = this.userShares;
  }

  get isTradeButtonDisabled(): boolean {
    if (this.isLoading) return true;

    const amount = Number(this.amount) || 0;
    const userBalance = Number(this.userBalance) || 0;
    const sharesToSell = Number(this.sharesToSell) || 0;
    const userShares = Number(this.userShares) || 0;

    if (this.isBuyMode) {
      if (amount <= 0 || amount > userBalance) return true;
    } else {
      if (sharesToSell <= 0 || sharesToSell > userShares) return true;
    }

    const isConnected = this.walletConnectService.walletStateSubject.value.isConnected;

    if (!isConnected) return false;

    return false;
  }

  get tradeButtonText(): string {
    if (this.isLoading) return 'Processing...';

    const isConnected = this.walletConnectService.walletStateSubject.value.isConnected;
    const amount = Number(this.amount) || 0;
    const userBalance = Number(this.userBalance) || 0;
    const sharesToSell = Number(this.sharesToSell) || 0;
    const userShares = Number(this.userShares) || 0;

    if (this.isBuyMode) {
      if (amount > userBalance) return 'Insufficient Balance';
      return 'Buy';
    } else {
      if (sharesToSell > userShares) return 'Insufficient Shares';
      return 'Sell';
    }
  }

  async executeTrade() {
    if (!await this.checkWalletConnection()) return;

    // Show confirmation modal
    const modalRef = this.modalService.open(DetailTransactionComponent, {
      centered: true,
      size: 'md'
    });

    // Pass data to modal
    modalRef.componentInstance.predictionTitle = this.predictionTitle;
    if (this.predictionType === 'BINARY') {
      modalRef.componentInstance.optionTitle = this.selectedOption === 'yes' ? 'YES' : 'NO';
    } else {
      modalRef.componentInstance.optionTitle = this.optionData?.option_title;
    }
    modalRef.componentInstance.isBuyMode = this.isBuyMode;
    modalRef.componentInstance.amount = this.isBuyMode ? this.amount : this.sharesToSell;
    modalRef.componentInstance.price = this.selectedOption === 'yes' ? this.yesPrice : this.noPrice;
    modalRef.componentInstance.potentialReturn = this.isBuyMode ? this.toWin : this.potentialProceeds;

    const result = await modalRef.result;

    if (result === true) {
      if (this.isBuyMode) {
        this.buyVote();
      } else {
        this.sellVote();
      }
    }
  }

  async buyVote(): Promise<void> {
    // Check if user has authentication token (registered user)
    const hasAuthToken = this.authService.isAuthenticated();

    // Check if user has wallet connection (for wallet-only users)
    const hasWalletConnection = await this.walletConnectService.checkConnection();

    if (!hasAuthToken && !hasWalletConnection) {
      console.error('User must be authenticated or have wallet connection to buy votes');
      return;
    }

    this.isLoading = true;

    const buyVoteParams: any = {
      prediction_option_multiple_id: this.predictionOptionId,
      side: this.selectedOption.toUpperCase(),
      amount_token: this.amount
    };

    // If user is wallet-connected but not token-authenticated, add signature data
    if (!hasAuthToken && hasWalletConnection) {
      const walletData = await this.generateWalletSignature();
      if (walletData) {
        buyVoteParams.message = walletData.message;
        buyVoteParams.signature = walletData.signature;
        buyVoteParams.coin_id = walletData.coin_id || 1; // Default to 1 if not specified
      }
    }

    const buyMethod = hasAuthToken ? this.tradeService.buyVote(buyVoteParams) : this.tradeService.buyPublicVote(buyVoteParams);

    buyMethod.subscribe({
      next: (response: any) => {
        this.isLoading = false;

        // Handle authentication response for public votes
        if (!hasAuthToken && response.data && Array.isArray(response.data) && response.data.length >= 2) {
          // Extract auth data and buy vote data from response
          const authData = response.data[0]; // AuthResponse object
          const buyVoteData = response.data[1]; // BuyVoteResponse object

          // Store authentication token if provided
          if (authData && authData.expires) {
            localStorage.setItem('expirationDate', authData.expires);
            // Set security token cookie (this should be handled by the browser from the response cookie)
          }

          // Check buy vote success
          if (buyVoteData?.success) {
            this.confirmDialogService.showSuccess({
              title: 'Compra Exitosa',
              message1: `Has comprado exitosamente por ${this.amount} Fierce.`
            });
            console.log('Vote purchased successfully:', buyVoteData);
            // Handle success - maybe update prices, show confirmation, etc.
          } else {
            console.error('Error purchasing vote:', buyVoteData?.message);
          }
        } else {
          // Handle regular authenticated response
          if (response.data?.success) {
            this.confirmDialogService.showSuccess({
              title: 'Compra Exitosa',
              message1: `Has comprado exitosamente por ${this.amount} Fierce.`
            });
            console.log('Vote purchased successfully:', response.data);
            // Handle success - maybe update prices, show confirmation, etc.
          } else {
            console.error('Error purchasing vote:', response.data?.message);
          }
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error purchasing vote:', error);
      }
    });
  }

  /**
   * Generate wallet signature data for public vote purchase
   */
  private async generateWalletSignature(): Promise<{ message: string; signature: string; coin_id?: number } | null> {
    try {
      const walletAddress = await this.walletConnectService.getConnectedWalletAddress();

      // Create a message for signing
      const message = `Buy vote for prediction option ${this.predictionOptionId} with ${this.amount} Fierce at ${new Date().toISOString()}`;

      // Sign the message
      const signatureData = await this.walletConnectService.signMessage(message);

      return {
        message: signatureData.message,
        signature: signatureData.signature,
        coin_id: 1 // Default coin_id, adjust as needed
      };
    } catch (error) {
      console.error('Error generating wallet signature:', error);
      return null;
    }
  }

  sellVote() {
    if (!this.authService.isAuthenticated()) {
      console.error('User must be authenticated to sell votes');
      return;
    }

    if (this.userShares <= 0) {
      console.error('No shares available to sell');
      return;
    }

    this.isLoading = true;

    const sellVoteParams = {
      prediction_option_multiple_id: this.predictionOptionId,
      side: this.selectedOption.toUpperCase(),
      shares_to_sell: this.sharesToSell
    };

    this.tradeService.sellVote(sellVoteParams).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.data?.success) {
          this.confirmDialogService.showSuccess({
            title: 'Venta Exitosa',
            message1: `Has vendido exitosamente ${this.sharesToSell} acciones.`
          });
          console.log('Shares sold successfully:', response.data);
          // Update user shares
          this.userShares = Math.max(0, this.userShares - this.sharesToSell);
        } else {
          console.error('Error selling shares:', response.data?.message);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error selling shares:', error);
      }
    });
  }
}
