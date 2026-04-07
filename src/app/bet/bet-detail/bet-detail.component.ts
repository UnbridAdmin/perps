import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
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
import { PostCommentsComponent } from '../../shared/post-prediction/components/post-comments/post-comments.component';
import { ApiServices } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-bet-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, BetPoolComponent, FeaturedCommentComponent, PostCommentsComponent],
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
    private location: Location,
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

    // Load all data from pool service (single call)
    const poolCall = (isAuthenticated && isWalletConnected)
      ? this.betPoolService.getUserPredictionPoolData(this.predictionId)
      : this.betPoolService.getPredictionPoolData(this.predictionId);

    // Also fetch prediction details to get king_comment
    const predictionParams = {
      page: 1,
      limit: 1,
      predictionId: this.predictionId
    };

    const predictionCall = isAuthenticated && isWalletConnected
      ? this.postPredictionService.getAuthenticatedPredictions(predictionParams)
      : this.postPredictionService.getPublicPredictions(predictionParams);

    poolCall.subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const poolData = response.data;

          // Fetch prediction details to get king_comment
          predictionCall.subscribe({
            next: (predResponse: any) => {
              let kingComment = null;
              let predData = null;
              if (predResponse?.data?.data && predResponse.data.data.length > 0) {
                predData = predResponse.data.data[0];
                kingComment = predData.king_comment;
              }

              // Build prediction object from pool data (now includes header data)
              this.prediction = {
                prediction_id: poolData.predictionId,
                prediction_category_id: poolData.predictionCategoryId,
                creator: poolData.creatorUsername || 'Prediction Market',
                creatorAvatar: poolData.creatorAvatar || undefined,
                category: poolData.categoryName || 'General',
                question: poolData.predictionTitle,
                imageUrl: poolData.predictionImage || undefined,
                prediction_create_at: poolData.predictionCreateDate,
                prediction_end_date: poolData.predictionEndDate,
                betBurn: poolData.betBurn,
                betPlatformRewards: poolData.betPlatformRewards,
                creator_is_verified: predData?.creator_is_verified,
                featuredComment: kingComment ? {
                  user: kingComment.username,
                  avatar: kingComment.avatar || `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${kingComment.username}`,
                  text: kingComment.comment,
                  gifUrl: kingComment.url_image || undefined,
                  burnedAmount: kingComment.burned_fierce || 0,
                  is_verified: kingComment.is_verified
                } : null,
                marketInfo: {
                  poolAmount: poolData.marketInfo?.poolAmount || '0',
                  participants: poolData.betUsers || 0,
                  options: []
                },
                options: poolData.options?.map((opt: any) => ({
                  id: opt.id,
                  prediction_option_id: opt.id,
                  title: opt.title,
                  prediction_option_title: opt.title,
                  poolAmount: opt.poolAmount,
                  userInvestment: opt.userInvestment,
                  poolPercentage: opt.percentage,
                  totalBetUsers: opt.totalBetUsers
                })) || [],
                participants: poolData.betUsers?.toString() || '0'
              };
              this.isLoading = false;
            },
            error: (predError) => {
              console.error('Error loading prediction details:', predError);
              // Continue without king_comment
              this.prediction = {
                prediction_id: poolData.predictionId,
                prediction_category_id: poolData.predictionCategoryId,
                creator: poolData.creatorUsername || 'Prediction Market',
                creatorAvatar: poolData.creatorAvatar || undefined,
                category: poolData.categoryName || 'General',
                question: poolData.predictionTitle,
                imageUrl: poolData.predictionImage || undefined,
                prediction_create_at: poolData.predictionCreateDate,
                prediction_end_date: poolData.predictionEndDate,
                betBurn: poolData.betBurn,
                betPlatformRewards: poolData.betPlatformRewards,
                featuredComment: null,
                marketInfo: {
                  poolAmount: poolData.marketInfo?.poolAmount || '0',
                  participants: poolData.betUsers || 0,
                  options: []
                },
                options: poolData.options?.map((opt: any) => ({
                  id: opt.id,
                  prediction_option_id: opt.id,
                  title: opt.title,
                  prediction_option_title: opt.title,
                  poolAmount: opt.poolAmount,
                  userInvestment: opt.userInvestment,
                  poolPercentage: opt.percentage,
                  totalBetUsers: opt.totalBetUsers
                })) || [],
                participants: poolData.betUsers?.toString() || '0'
              };
              this.isLoading = false;
            }
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading bet details:', error);
      }
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
            this.loadBetDetails();
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
    this.location.back();
  }

  getPoolAmountWithoutUnit(): string {
    const poolAmount = this.prediction?.marketInfo?.poolAmount || '0';
    return poolAmount.toString().replace(/[^0-9.]/g, '');
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
