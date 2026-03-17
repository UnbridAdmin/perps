import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PostCommentsService } from './post-comments.service';
import { AuthorizationService } from '../../../../services/authorization.service';
import { ConfirmDialogService } from '../../../confirm-dialog/confirm-dialog.service';
import { SidebarMenuService } from '../../../../sidebar-menu/sidebar-menu.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

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
    private sidebarMenuService: SidebarMenuService
  ) {}

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

  submitComment() {
    if (!this.newCommentText.trim() && !this.gifUrl.trim()) return;

    if (!this.authService.isAuthenticated()) {
      this.confirmDialogService.showInfo({
        title: 'Inicio de sesión requerido',
        message1: 'Debes iniciar sesión para publicar comentarios.'
      });
      return;
    }

    this.isSubmitting = true;
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
          id: this.comments.length + 1,
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
}
