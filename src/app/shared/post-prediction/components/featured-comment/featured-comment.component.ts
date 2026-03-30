import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

    isExpanded = false;

    constructor(private sanitizer: DomSanitizer) {}

    toggleExpanded() {
        this.isExpanded = !this.isExpanded;
    }

    onOverthrow(event?: any) {
        if (event) {
            event.stopPropagation();
        }
        this.overthrow.emit();
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
