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
      gifUrl: this.gifUrl
    });
  }

  get burnAmount(): number {
    return this.gifUrl.trim() ? 1 : 0;
  }
}
