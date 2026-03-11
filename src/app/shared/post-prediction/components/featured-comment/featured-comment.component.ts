import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-featured-comment',
    standalone: true,
    imports: [CommonModule],
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
