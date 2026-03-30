import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BetPoolComponent } from '../../shared/post-prediction/components/bet-pool/bet-pool.component';
import { FeaturedCommentComponent } from '../../shared/post-prediction/components/featured-comment/featured-comment.component';
import { BetPoolService } from '../../shared/post-prediction/components/bet-pool/bet-pool.service';
import { PostPredictionService } from '../../shared/post-prediction/post-prediction.service';
import { AuthorizationService } from '../../services/authorization.service';
import { WalletConnectService } from '../../services/walletconnect.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { SidebarMenuService } from '../../sidebar-menu/sidebar-menu.service';
import { FeaturedCommentService } from '../../shared/post-prediction/components/featured-comment/featured-comment.service';
import { ApiServices } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-bet-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, BetPoolComponent, FeaturedCommentComponent],
  templateUrl: './bet-detail.component.html',
  styleUrl: './bet-detail.component.scss',
})
export class BetDetailComponent implements OnInit, OnDestroy {
  predictionId: number = 0;
  prediction: any = null;
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
    private betPoolService: BetPoolService,
    private postPredictionService: PostPredictionService,
    private authService: AuthorizationService,
    private walletConnectService: WalletConnectService,
    private confirmDialogService: ConfirmDialogService,
    private sidebarMenuService: SidebarMenuService,
    private featuredCommentService: FeaturedCommentService,
    private apiService: ApiServices
  ) { }

  ngOnInit() {
    this.subscriptions.add(
      this.route.params.subscribe(params => {
        this.predictionId = +params['id'] || 0;
        if (this.predictionId) {
          this.loadBetDetails();
        }
      })
    );
  }

  async loadBetDetails(): Promise<void> {
    this.isLoading = true;

    const isAuthenticated = this.authService.isAuthenticated();
    const isWalletConnected = await this.walletConnectService.checkConnection();

    // Load prediction data
    const params: any = {
      page: 1,
      limit: 1,
      predictionId: this.predictionId
    };

    const apiCall = (isAuthenticated && isWalletConnected)
      ? this.postPredictionService.getAuthenticatedPredictions(params)
      : this.postPredictionService.getPublicPredictions(params);

    apiCall.subscribe({
      next: (response: any) => {
        const apiResponse = response.data;
        if (apiResponse?.data && apiResponse.data.length > 0) {
          const apiPred = apiResponse.data[0];

          // Calculate totals for percentages
          const totalVotes = apiPred.options.reduce((sum: number, opt: any) =>
            sum + (opt.prediction_intuition_votes || 0), 0);

          this.prediction = {
            prediction_id: apiPred.prediction_id,
            prediction_category_id: apiPred.prediction_category_id,
            creator: apiPred.creatorUsername || 'Prediction Market',
            creatorAvatar: apiPred.creatorAvatar || undefined,
            category: apiPred.categoryName || 'General',
            question: apiPred.prediction_title,
            imageUrl: apiPred.prediction_image || undefined,
            totalVolume: apiPred.totalVolume || 0,
            prediction_create_at: apiPred.prediction_create_at,
            prediction_end_date: apiPred.prediction_end_date,
            prediction_mutual_amount: apiPred.prediction_mutual_amount,
            betBurn: apiPred.betBurn,
            betPlatformRewards: apiPred.betPlatformRewards,
            options: apiPred.options.map((opt: any) => ({
              id: opt.prediction_option_id,
              prediction_option_id: opt.prediction_option_id,
              title: opt.prediction_option_title,
              prediction_option_title: opt.prediction_option_title,
              votes: opt.prediction_intuition_votes || 0,
              percentage: totalVotes > 0
                ? Math.round(((opt.prediction_intuition_votes || 0) / totalVotes) * 100)
                : 0
            })),
            marketInfo: {
              poolAmount: apiPred.prediction_mutual_amount?.toString() || '0',
              participants: parseInt(apiPred.totalParticipants) || 0,
              options: []
            },
            featuredComment: apiPred.king_comment ? {
              user: apiPred.king_comment.username,
              avatar: apiPred.king_comment.avatar || 'https://api.dicebear.com/9.x/fun-emoji/svg',
              text: apiPred.king_comment.comment,
              gifUrl: apiPred.king_comment.url_image || undefined,
              burnedAmount: apiPred.king_comment.burned_fierce
            } : undefined,
            participants: apiPred.totalParticipants,
            b_param: apiPred.b_param,
            fee_rate: apiPred.fee_rate
          };

          // Load pool data
          this.loadPoolData();
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading bet details:', error);
      }
    });
  }

  private loadPoolData(): void {
    const isAuthenticated = this.authService.isAuthenticated();

    const poolCall = isAuthenticated
      ? this.betPoolService.getUserPredictionPoolData(this.predictionId)
      : this.betPoolService.getPredictionPoolData(this.predictionId);

    poolCall.subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const poolData = response.data;

          if (this.prediction) {
            this.prediction.marketInfo.poolAmount = poolData.marketInfo?.poolAmount || '0';

            if (this.prediction.options && poolData.options) {
              poolData.options.forEach((poolOpt: any) => {
                const matchingOption = this.prediction.options.find(
                  (o: any) => (o.id || o.prediction_option_id) === poolOpt.id
                );
                if (matchingOption) {
                  matchingOption.poolAmount = poolOpt.poolAmount;
                  matchingOption.userInvestment = poolOpt.userInvestment;
                  matchingOption.poolPercentage = poolOpt.percentage;
                  matchingOption.totalBetUsers = poolOpt.totalBetUsers;
                }
              });
            }
          }
        }
      },
      error: (err) => console.error('Error loading pool data:', err)
    });
  }

  async onPlaceMutualBet(event: { optionId: number, amount: number }): Promise<void> {
    const { optionId, amount } = event;

    try {
      if (!this.authService.isAuthenticated()) {
        await this.confirmDialogService.showInfo({
          title: 'Inicio de sesión requerido',
          message1: 'Debes iniciar sesión para realizar apuestas.'
        });
        return;
      }

      this.betPoolService.placeMutualBet({
        predictionId: this.predictionId,
        optionId: optionId,
        amount: amount
      }).subscribe({
        next: async (response: any) => {
          if (response.success) {
            await this.confirmDialogService.showSuccess({
              title: 'Apuesta registrada',
              message1: `Tu apuesta de ${amount} F ha sido procesada exitosamente.`
            });
            this.loadPoolData();
            this.sidebarMenuService.notifyBalanceUpdate();
          } else {
            await this.confirmDialogService.showError({
              title: 'Error',
              message1: response.message || 'No se pudo procesar la apuesta.'
            });
          }
        },
        error: async (err: any) => {
          console.error('Bet error:', err);
          await this.confirmDialogService.showError({
            title: 'Error del servidor',
            message1: err.error?.message || 'Error al procesar la apuesta.'
          });
        }
      });
    } catch (error) {
      console.error('Error in betting process:', error);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  goBack() {
    this.router.navigate(['/home']);
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

      const currentKingBurn = this.prediction?.featuredComment?.burnedAmount || 0;
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
          this.loadBetDetails();
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
