import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PostCommentsService } from './post-comments.service';
import { AuthorizationService } from '../../../../services/authorization.service';
import { ConfirmDialogService } from '../../../confirm-dialog/confirm-dialog.service';
import { SidebarMenuService } from '../../../../sidebar-menu/sidebar-menu.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { WalletConnectService } from '../../../../services/walletconnect.service';
import { ApiServices } from '../../../../services/api.service';
import { firstValueFrom } from 'rxjs';

interface Comment {
  id: number;
  user: string;
  avatar: string;
  text: string;
  timeAgo: string;
  likes: number;
  isLiked?: boolean;
  gifUrl?: string;
}

@Component({
  selector: 'app-post-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, InfiniteScrollModule, RouterModule],
  templateUrl: './post-comments.component.html',
  styleUrls: ['./post-comments.component.scss']
})
export class PostCommentsComponent implements OnInit {
  @Input() predictionId!: number;
  @Input() prediction: any; // Full prediction object for context

  isExpanded: boolean = false;
  newCommentText: string = '';
  gifUrl: string = '';
  showGifInput: boolean = false;
  isSubmitting: boolean = false;

  comments: Comment[] = [];
  page: number = 1;
  limit: number = 10;
  isLoading: boolean = false;
  hasMoreData: boolean = true;

  constructor(
    private postCommentsService: PostCommentsService,
    private authService: AuthorizationService,
    private confirmDialogService: ConfirmDialogService,
    private sidebarMenuService: SidebarMenuService,
    private walletConnectService: WalletConnectService,
    private apiService: ApiServices,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    if (this.predictionId) {
      this.loadComments();
    }
  }

  loadComments(infinite: boolean = false) {
    if (this.isLoading || (!this.hasMoreData && infinite)) return;

    this.isLoading = true;
    if (!infinite) {
      this.page = 1;
      this.comments = [];
      this.hasMoreData = true;
    }

    this.postCommentsService.getComments(this.predictionId, this.page, this.limit).subscribe({
      next: (response) => {
        this.isLoading = false;
        const apiResponse = response.data;
        const apiComments = apiResponse?.data || [];

        if (apiComments.length < this.limit) {
          this.hasMoreData = false;
        }

        const mappedComments: Comment[] = apiComments.map((apiComment: any) => ({
          id: apiComment.comment_id,
          user: apiComment.username,
          avatar: apiComment.avatar || `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${apiComment.username}`,
          text: apiComment.comment,
          gifUrl: apiComment.url_image,
          timeAgo: this.formatTimeAgo(apiComment.created_at),
          likes: 0 // Backend currently doesn't support likes
        }));

        this.comments = [...this.comments, ...mappedComments];
        this.page++;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading comments', error);
      }
    });
  }

  onScroll() {
    this.loadComments(true);
  }

  private formatTimeAgo(dateString: string): string {
    if (!dateString) return 'recently';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  expandInput() {
    this.isExpanded = true;
  }

  toggleGifInput() {
    this.showGifInput = !this.showGifInput;
  }

  async submitComment() {
    if (!this.newCommentText.trim() && !this.gifUrl.trim()) return;

    this.isSubmitting = true;

    try {
      // If user is not authenticated, we need to create user account/get token first
      if (!this.authService.isAuthenticated()) {
        const isConnected = await this.walletConnectService.checkConnection();
        if (!isConnected) {
          this.isSubmitting = false;
          this.confirmDialogService.showInfo({
            title: 'Billetera requerida',
            message1: 'Por favor, conecta tu billetera para poder comentar.'
          });
          return;
        }

        const walletAddress = await this.walletConnectService.getConnectedWalletAddress();

        try {
          const existResponse = await this.authService.existUser({ address: walletAddress }).toPromise() as any;
          if (existResponse?.data?.exists) {
            this.isSubmitting = false;
            // User exists in DB but not authenticated - show login required
            this.confirmDialogService.showInfo({
              title: 'Inicio de sesión requerido',
              message1: 'Debes iniciar sesión para publicar comentarios.'
            });
            return;
          }
        } catch (error) {
          console.error('Error checking if user exists:', error);
        }

        // Generate message to sign
        const message = `Click to sign in and accept the Unbrid Terms of Service(https://unbrid.com/privacy-policy). Login with secure code: ${Date.now()}`;

        // Request signature
        const signatureData = await this.walletConnectService.signMessage(message);

        // Create user request payload
        const createUserRequest = {
          address: walletAddress,
          coin_id: 1,
          message: signatureData.message,
          signature: signatureData.signature,
          referral_code: 'syyPTsvh70245910'
        };

        // Call secure-create-user endpoint
        const createUserResponse = await firstValueFrom(
          this.apiService.publicApiCall('user/secure-create-user', 'POST', createUserRequest)
        ) as any;

        if (createUserResponse?.success || createUserResponse?.message === 'SUCCESS') {
          if (createUserResponse?.data && createUserResponse.data.length > 0) {
            this.authService.setSession(createUserResponse.data[0].expires, walletAddress);
          }
        } else {
          console.error("Authentication Payload Response:", createUserResponse);
          throw new Error('Failed to authenticate');
        }
      }

      // Proceed with comment submission
      this.postCommentsService.submitComment(
        this.predictionId,
        this.newCommentText,
        this.gifUrl,
        this.burnAmount
      ).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          console.log('Comment submitted successfully', response);
          const newComment: Comment = {
            id: Date.now(), // Use timestamp as temp ID
            user: 'You',
            avatar: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=you',
            text: this.newCommentText,
            gifUrl: this.gifUrl,
            timeAgo: 'Just now',
            likes: 0
          };

          this.comments.unshift(newComment);
          this.resetForm();

          if (this.burnAmount > 0) {
            this.sidebarMenuService.notifyBalanceUpdate();
          }

          this.confirmDialogService.showSuccess({
            title: 'Comentario publicado',
            message1: 'Tu comentario ha sido publicado exitosamente.'
          });
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error submitting comment', error);
          this.confirmDialogService.showError({
            title: 'Error',
            message1: error.error?.message || 'Hubo un problema al publicar tu comentario.'
          });
        }
      });

    } catch (error) {
      this.isSubmitting = false;
      console.error('Authentication error:', error);
      this.confirmDialogService.showError({
        title: 'Error de autenticación',
        message1: 'No se pudo autenticar tu cuenta. Por favor intenta de nuevo.'
      });
    }
  }

  resetForm() {
    this.newCommentText = '';
    this.gifUrl = '';
    this.isExpanded = false;
    this.showGifInput = false;
  }

  get burnAmount(): number {
    return this.gifUrl.trim() ? 1 : 0;
  }

  toggleLike(comment: Comment) {
    if (comment.isLiked) {
      comment.likes--;
      comment.isLiked = false;
    } else {
      comment.likes++;
      comment.isLiked = true;
    }
  }

  getTextWithLinks(text: string): SafeHtml {
    if (!text) return '';

    // Regular expression to detect URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Replace URLs with anchor tags that open in new tab
    const processedText = text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: var(--primary-color, #007bff); text-decoration: underline;">${url}</a>`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(processedText);
  }
}
