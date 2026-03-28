import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TradeService } from '../trade.service';
import { AuthorizationService } from '../../services/authorization.service';
import moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DetailTransactionComponent } from '../detail-transaction/detail-transaction.component';
import { WalletConnectService } from '../../services/walletconnect.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { SidebarMenuService } from '../../sidebar-menu/sidebar-menu.service';

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
  @Input() predictionId: number = 0;
  @Input() bParam: number = 10;
  @Input() feeRate: number = 0.01;
  @Input() initialSide: 'yes' | 'no' = 'yes';
  @Input() isBuyMode: boolean = true;
  @Output() onModeChange = new EventEmitter<boolean>();
  selectedOption: 'yes' | 'no' = 'yes';
  amount = 1;
  sharesToSell = 0;
  maxAmount = 0;

  avgPrice = 0;
  avgSellPrice = 0;

  get yesPrice(): number {
    return this.calculateEffectivePrice('yes');
  }

  get noPrice(): number {
    return this.calculateEffectivePrice('no');
  }

  calculateEffectivePrice(option: 'yes' | 'no'): number {
    let targetObj: any;
    if (this.predictionType?.toUpperCase() === 'BINARY' && this.options && this.options.length > 0) {
      targetObj = this.options.find(o => o.option_title?.toUpperCase() === option.toUpperCase());
      if (!targetObj && option === 'no' && this.options.length > 0) {
        targetObj = this.options[0];
      }
    } else {
      targetObj = this.optionData;
    }

    if (!targetObj) return 0.5;

    let spotPrice = targetObj.price || 0.5;
    if (option === 'no') {
      const isActuallyYesSource = targetObj.option_title?.toUpperCase() === 'YES' || this.predictionType?.toUpperCase() === 'MULTIPLE';
      if (isActuallyYesSource) spotPrice = 1 - spotPrice;
    }

    const b = this.bParam || 10;
    const fee = this.feeRate || 0.01;
    let amt = 1;
    
    if (this.isBuyMode) {
      amt = Number(this.amount) || 1;
    } else {
      amt = Number(this.sharesToSell) || 1;
    }

    return this.tradeService.calculateEffectivePrice(
      this.isBuyMode,
      amt,
      spotPrice,
      b,
      fee
    );
  }

  isLoading = false;

  constructor(
    private tradeService: TradeService,
    private authService: AuthorizationService,
    private walletConnectService: WalletConnectService,
    private confirmDialogService: ConfirmDialogService,
    private modalService: NgbModal,
    private sidebarMenuService: SidebarMenuService
  ) { }

  ngOnInit() {
    this.updateFromOptionData();
    this.onModeChange.emit(this.isBuyMode);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['optionData'] && this.predictionType === 'BINARY' && this.optionData) {
      const title = this.optionData.option_title?.toUpperCase();
      if (title === 'YES') this.selectedOption = 'yes';
      else if (title === 'NO') this.selectedOption = 'no';
    }

    if (changes['initialSide'] && this.initialSide) {
      this.selectedOption = this.initialSide;
    }

    if (changes['optionData'] || changes['userBalance'] || changes['predictionTitle'] || changes['options'] || changes['predictionType'] || changes['initialSide']) {
      this.updateFromOptionData();
    }
  }

  private updateFromOptionData() {
    // 1. Logic for BINARY predictions
    if (this.predictionType?.toUpperCase() === 'BINARY' && this.options && this.options.length > 0) {
      const yesOption = this.options.find(o => o.option_title?.toUpperCase() === 'YES');
      const noOption = this.options.find(o => o.option_title?.toUpperCase() === 'NO');

      // Extract data for the selected side
      const selectedObj = this.selectedOption === 'yes' ? yesOption : noOption;

      if (selectedObj) {
        this.predictionOptionId = selectedObj.option_multiple_id;
        if (this.selectedOption === 'yes') {
          this.userShares = Number(selectedObj.user_shares_yes) || 0;
          this.avgPrice = Number(selectedObj.avg_buy_price_yes) || selectedObj.price;
          this.avgSellPrice = Number(selectedObj.avg_sell_price_yes) || 0;
        } else {
          this.userShares = Number(selectedObj.user_shares_no) || 0;
          this.avgPrice = Number(selectedObj.avg_buy_price_no) || selectedObj.price;
          this.avgSellPrice = Number(selectedObj.avg_sell_price_no) || 0;
        }
      }
    }
    // 2. Logic for MULTIPLE predictions
    else if (this.optionData) {
      this.predictionOptionId = this.optionData.option_multiple_id;
      const spotPrice = Number(this.optionData.price) || 0.5;

      // Handle YES/NO shares and avg prices for MULTIPLE
      if (this.selectedOption === 'yes') {
        this.userShares = Number(this.optionData.user_shares_yes) || 0;
        this.avgPrice = Number(this.optionData.avg_buy_price_yes) || spotPrice;
        this.avgSellPrice = Number(this.optionData.avg_sell_price_yes) || 0;
      } else {
        this.userShares = Number(this.optionData.user_shares_no) || 0;
        this.avgPrice = Number(this.optionData.avg_buy_price_no) || (1 - spotPrice);
        this.avgSellPrice = Number(this.optionData.avg_sell_price_no) || 0;
      }
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
    this.onModeChange.emit(this.isBuyMode);
    this.updateFromOptionData();

    // When switching to SELL mode, auto-load shares
    if (!buyMode) {
      this.sharesToSell = this.userShares;
    }
  }

  selectOption(option: 'yes' | 'no') {
    this.selectedOption = option;
    this.updateFromOptionData();

    // In SELL mode, auto-load the shares for the selected option
    if (!this.isBuyMode) {
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

  get estAvgPrice(): number {
    return this.selectedOption === 'yes' ? this.yesPrice : this.noPrice;
  }

  get toWin(): number {
    const price = this.estAvgPrice;
    if (!price || !this.amount) return 0;
    // Payout logic: Each share pays $1 if correct.
    // Shares = amount / effective_price
    const payout = (Number(this.amount) / price);
    return parseFloat(payout.toFixed(2));
  }

  get potentialProceeds(): number {
    const price = this.estAvgPrice;
    if (!price || !this.sharesToSell) return 0;
    // Expected proceeds: Shares * effective_price
    return parseFloat((Number(this.sharesToSell) * price).toFixed(2));
  }

  async setAmount(value: number) {
    if (!await this.checkWalletConnection()) return;
    this.amount = parseFloat((Number(this.amount) + value).toFixed(2));
    if (this.amount > this.maxAmount) this.amount = this.maxAmount;
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

  async setSharesPercent(percent: number) {
    if (!await this.checkWalletConnection()) return;
    this.sharesToSell = parseFloat((this.userShares * (percent / 100)).toFixed(2));
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
    modalRef.componentInstance.predictionId = this.predictionId.toString();
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
            // Notify trade completion to update outcomes and balance
            this.tradeService.notifyTradeCompleted(true, this.predictionId);
            this.sidebarMenuService.notifyBalanceUpdate();
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
            // Notify trade completion to update outcomes and balance
            this.tradeService.notifyTradeCompleted(true, this.predictionId);
            this.sidebarMenuService.notifyBalanceUpdate();
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
          // Notify trade completion to update outcomes and balance
          this.tradeService.notifyTradeCompleted(true, this.predictionId);
          this.sidebarMenuService.notifyBalanceUpdate();
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
