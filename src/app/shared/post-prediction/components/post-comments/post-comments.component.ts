import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
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

  comments: Comment[] = [
    {
      id: 1,
      user: 'CryptoWhale',
      avatar: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=whale',
      text: 'This is a game changer! I really think the market is underestimating the potential here.',
      timeAgo: '2h ago',
      likes: 12
    },
    {
      id: 2,
      user: 'MoonSeeker',
      avatar: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=moon',
      text: 'Totally agree. The fundamentals look solid. Buying more F tokens now! 🚀',
      timeAgo: '1h ago',
      likes: 5
    },
    {
      id: 3,
      user: 'TraderJoe',
      avatar: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=joe',
      text: 'I am not so sure. The volume is still low. Let\'s see how it plays out in the next 24 hours.',
      timeAgo: '30m ago',
      likes: 2
    },
    {
      id: 4,
      user: 'FierceOreo',
      avatar: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=oreo',
      text: 'Look at this pump!',
      gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3NjNHJqZ3NjNHJqZ3NjNHJqZ3NjNHJqZ3NjNHJqZ3NjNHJqZ3NjJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/mi6hcCqS9pkkSWMWAc/giphy.gif',
      timeAgo: '10m ago',
      likes: 8
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  expandInput() {
    this.isExpanded = true;
  }

  toggleGifInput() {
    this.showGifInput = !this.showGifInput;
  }

  submitComment() {
    if (!this.newCommentText.trim() && !this.gifUrl.trim()) return;

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
