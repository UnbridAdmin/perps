import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-post-reply-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-reply-modal.component.html',
  styleUrls: ['./post-reply-modal.component.scss']
})
export class PostReplyModalComponent implements OnInit {
  @Input() prediction: any; // The prediction/post being replied to
  @Input() mode: 'reply' | 'overthrow' = 'reply';
  @Input() currentKing: any = null; // The current featured comment to be overthrown

  commentText: string = '';
  gifUrl: string = '';
  showGifInput: boolean = false;
  
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}

  toggleGifInput() {
    this.showGifInput = !this.showGifInput;
  }

  submit() {
    if (!this.commentText.trim() && !this.gifUrl.trim()) return;
    
    this.activeModal.close({
      text: this.commentText,
      gifUrl: this.gifUrl,
      burnAmount: this.burnAmount
    });
  }

  get burnAmount(): number {
    if (this.mode === 'overthrow') {
      // For overthrow, they must burn more than the current king or a minimum amount
      const currentBurn = this.currentKing?.burnedAmount || 0;
      return currentBurn + 1; // Simplification for UI demonstration
    }
    return this.gifUrl.trim() ? 1 : 0;
  }
}
