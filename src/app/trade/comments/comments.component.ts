import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Comment {
  id: number;
  author: string;
  username: string;
  timeAgo: string;
  content: string;
  likes: number;
  replies: number;
}

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss',
})
export class CommentsComponent implements OnInit {
  @Input() predictionId: string = '';

  comments: Comment[] = [];

  private allComments: { [key: string]: Comment[] } = {
    'default': [
      {
        id: 1,
        author: 'RealityFan',
        username: '@realityfan',
        timeAgo: '2h',
        content: 'Camila ha tenido muchos conflictos esta semana. Creo que tiene altas probabilidades de ser eliminada.',
        likes: 24,
        replies: 3
      },
      {
        id: 2,
        author: 'ShowAnalyst',
        username: '@showanalyst',
        timeAgo: '4h',
        content: 'Andrés está jugando muy bien su estrategia. No creo que lo eliminen todavía.',
        likes: 18,
        replies: 5
      },
      {
        id: 3,
        author: 'TVWatcher',
        username: '@tvwatcher',
        timeAgo: '6h',
        content: 'Alexandra y Samuel están volando bajo el radar. Podría ser una sorpresa.',
        likes: 42,
        replies: 8
      }
    ]
  };

  ngOnInit() {
    this.loadComments();
  }

  private loadComments() {
    if (this.predictionId && this.allComments[this.predictionId]) {
      this.comments = this.allComments[this.predictionId];
    } else {
      this.comments = this.allComments['default'];
    }
  }
}
