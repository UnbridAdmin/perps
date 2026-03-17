import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-featured-comment',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './featured-comment.component.html',
    styleUrls: ['./featured-comment.component.scss']
})
export class FeaturedCommentComponent {
    @Input() comment: any; // Example: { user: 'CryptoKing', avatar: '...', text: 'Brasil gana fijo!', burnedAmount: 500 }
    @Output() overthrow = new EventEmitter<void>();

    onOverthrow() {
        this.overthrow.emit();
    }
}
