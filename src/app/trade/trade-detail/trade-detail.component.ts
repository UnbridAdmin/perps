import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { OutcomeComponent } from '../outcome/outcome.component';
import { TradingPanelComponent } from '../trading-panel/trading-panel.component';
import { PostCommentsComponent } from '../../shared/post-prediction/components/post-comments/post-comments.component';
import { PriceTrendComponent } from '../price-trend/price-trend.component';
import { IntuitionVsMarketAnalysisComponent } from '../intuition-vs-market-analysis/intuition-vs-market-analysis.component';
import { FeaturedCommentComponent } from '../../shared/post-prediction/components/featured-comment/featured-comment.component';
import { TradeService } from '../trade.service';
import { AuthorizationService } from '../../services/authorization.service';
import { WalletConnectService } from '../../services/walletconnect.service';
import { FeaturedCommentService } from '../../shared/post-prediction/components/featured-comment/featured-comment.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { SidebarMenuService } from '../../sidebar-menu/sidebar-menu.service';
import { ApiServices } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'app-trade-detail',
  standalone: true,
  imports: [CommonModule, OutcomeComponent, TradingPanelComponent, PostCommentsComponent, IntuitionVsMarketAnalysisComponent, FeaturedCommentComponent, FormsModule],
  templateUrl: './trade-detail.component.html',
  styleUrl: './trade-detail.component.scss',
})
export class TradeDetailComponent implements OnInit, OnDestroy {
  predictionId: number = 0;
  tradeData: any = null;
  currentPrediction: any = null;
  selectedOptionData: any = null;
  selectedSide: 'yes' | 'no' = 'yes';
  isBuyMode: boolean = true;
  isLoading = false;
  private subscriptions: Subscription = new Subscription();

  // Overthrow form state
  overthrowForm = {
    isExpanded: false,
    text: '',
    gifUrl: '',
    showGifInput: false,
    isSubmitting: false
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private tradeService: TradeService,
    private authService: AuthorizationService,
    private walletConnectService: WalletConnectService,
    private featuredCommentService: FeaturedCommentService,
    private confirmDialogService: ConfirmDialogService,
    private sidebarMenuService: SidebarMenuService,
    private apiService: ApiServices
  ) { }

  ngOnInit() {
    // Get prediction ID from route params
    this.subscriptions.add(
      this.route.params.subscribe(params => {
        this.predictionId = +params['id'] || 0;
        if (this.predictionId) {
          this.loadTradeDetails();
        }
      })
    );

    // Subscribe to trade completion notifications to refresh data
    this.subscriptions.add(
      this.tradeService.tradeCompleted$.subscribe(({ success, predictionId }) => {
        if (success && predictionId === this.predictionId) {
          console.log('Trade completed, refreshing trade details...');
          this.loadTradeDetails();
        }
      })
    );
  }

  handleOptionSelect(event: any) {
    if (event.optionData) {
      this.selectedOptionData = event.optionData;
      this.selectedSide = event.side || 'yes';
      if (event.isBuyMode !== undefined) {
        this.isBuyMode = event.isBuyMode;
      }
    } else {
      this.selectedOptionData = event;
      this.selectedSide = 'yes';
    }
  }

  async loadTradeDetails(): Promise<void> {
    this.isLoading = true;

    // Check both authentication and wallet connection
    const isAuthenticated = this.authService.isAuthenticated();
    const isWalletConnected = await this.walletConnectService.checkConnection();

    const apiCall = (isAuthenticated && isWalletConnected)
      ? this.tradeService.getTradeDetails({ prediction_id: this.predictionId })
      : this.tradeService.getTradePublicDetails({ prediction_id: this.predictionId });

    apiCall.subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.data?.success) {
          this.tradeData = this.tradeService.mapTradeDetailsResponse(response);
          if (response.data?.prediction) {
            const rawPred = response.data.prediction;
            this.currentPrediction = {
              ...rawPred,
              prediction_id: rawPred.prediction_id,
              creator: rawPred.creatorUsername,
              featuredComment: rawPred.king_comment ? {
                user: rawPred.king_comment.username,
                avatar: rawPred.king_comment.avatar || 'https://api.dicebear.com/9.x/fun-emoji/svg',
                text: rawPred.king_comment.comment,
                gifUrl: rawPred.king_comment.url_image || undefined,
                burnedAmount: rawPred.king_comment.burned_fierce
              } : undefined
            };
          }
          if (this.tradeData && this.tradeData.options && this.tradeData.options.length > 0) {
            this.selectedOptionData = this.tradeData.options[0];
          }
        } else {
          console.error('Error loading trade details:', response.data?.message);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading trade details:', error);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  goBack() {
    this.location.back();
  }

  // Overthrow logic
  toggleOverthrowForm(): void {
    this.overthrowForm.isExpanded = !this.overthrowForm.isExpanded;
  }

  cancelOverthrow(): void {
    this.overthrowForm.isExpanded = false;
    this.overthrowForm.text = '';
    this.overthrowForm.gifUrl = '';
    this.overthrowForm.showGifInput = false;
  }

  toggleOverthrowGifInput(): void {
    this.overthrowForm.showGifInput = !this.overthrowForm.showGifInput;
  }

  async submitOverthrow() {
    if (!this.overthrowForm.text.trim() && !this.overthrowForm.gifUrl.trim()) return;

    this.overthrowForm.isSubmitting = true;

    try {
      if (!this.authService.isAuthenticated()) {
        const isConnected = await this.walletConnectService.checkConnection();
        if (!isConnected) {
          this.overthrowForm.isSubmitting = false;
          this.confirmDialogService.showInfo({
            title: 'Billetera requerida',
            message1: 'Por favor, conecta tu billetera para poder destronar.'
          });
          return;
        }

        const walletAddress = await this.walletConnectService.getConnectedWalletAddress();

        try {
          const existResponse = await this.authService.existUser({ address: walletAddress }).toPromise() as any;
          if (existResponse?.data?.exists) {
            this.overthrowForm.isSubmitting = false;
            this.confirmDialogService.showInfo({
              title: 'Inicio de sesión requerido',
              message1: 'Debes iniciar sesión para destronar al rey.'
            });
            return;
          }
        } catch (error) {
          console.error('Error checking if user exists:', error);
        }

        const message = `Click to sign in and accept the Unbrid Terms of Service(https://unbrid.com/privacy-policy). Login with secure code: ${Date.now()}`;
        const signatureData = await this.walletConnectService.signMessage(message);

        const createUserRequest = {
          address: walletAddress,
          coin_id: 1,
          message: signatureData.message,
          signature: signatureData.signature,
          referral_code: 'syyPTsvh70245910'
        };

        const createUserResponse = await firstValueFrom(
          this.apiService.publicApiCall('user/secure-create-user', 'POST', createUserRequest)
        ) as any;

        if (createUserResponse?.success || createUserResponse?.message === 'SUCCESS') {
          if (createUserResponse?.data && createUserResponse.data.length > 0) {
            this.authService.setSession(createUserResponse.data[0].expires, walletAddress);
          }
        } else {
          throw new Error('Failed to authenticate');
        }
      }

      const currentKingBurn = this.currentPrediction?.featuredComment?.burnedAmount || 0;
      const newBurnAmount = currentKingBurn + 1;

      this.featuredCommentService.overthrowKing(
        this.predictionId,
        this.overthrowForm.text,
        this.overthrowForm.gifUrl,
        newBurnAmount
      ).subscribe({
        next: (response) => {
          this.overthrowForm.isSubmitting = false;
          this.confirmDialogService.showSuccess({
            title: '¡Has reclamado el trono!',
            message1: 'Tu comentario es ahora el Rey de la Colina.'
          });
          this.cancelOverthrow();
          this.loadTradeDetails(); // Refresh to show the new king
          this.sidebarMenuService.notifyBalanceUpdate();
        },
        error: (error) => {
          this.overthrowForm.isSubmitting = false;
          console.error('Error submitting overthrow', error);
          this.confirmDialogService.showError({
            title: 'Error',
            message1: error.error?.message || 'Hubo un problema al reclamar el trono.'
          });
        }
      });

    } catch (error) {
      this.overthrowForm.isSubmitting = false;
      console.error('Submission error:', error);
      this.confirmDialogService.showError({
        title: 'Error',
        message1: 'Hubo un problema al procesar tu solicitud.'
      });
    }
  }
}
