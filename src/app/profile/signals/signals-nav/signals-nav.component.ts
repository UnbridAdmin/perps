import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../../shared/models/signal.model';

@Component({
    selector: 'app-signals-nav',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './signals-nav.component.html',
    styleUrl: './signals-nav.component.scss'
})
export class SignalsNavComponent {
    @Input() categories: Category[] = [];
    @Output() categorySelected = new EventEmitter<{ categoryId: string, subCategoryId?: string }>();

    selectedCategoryId: string | null = null;
    selectedSubCategoryId: string | null = null;

    selectCategory(category: Category) {
        this.selectedCategoryId = category.id;
        this.selectedSubCategoryId = null;
        this.categorySelected.emit({ categoryId: category.id });
    }

    selectSubCategory(category: Category, subCategory: Category) {
        this.selectedCategoryId = category.id;
        this.selectedSubCategoryId = subCategory.id;
        this.categorySelected.emit({ categoryId: category.id, subCategoryId: subCategory.id });
    }

    isActive(categoryId: string): boolean {
        return this.selectedCategoryId === categoryId;
    }

    isSubActive(subCategoryId: string): boolean {
        return this.selectedSubCategoryId === subCategoryId;
    }

    getSubCategories(): Category[] | undefined {
        return this.categories.find(c => c.id === this.selectedCategoryId)?.children;
    }

    selectSubCategoryById(subId: string) {
        const parent = this.categories.find(c => c.id === this.selectedCategoryId);
        if (parent) {
            this.selectedSubCategoryId = subId;
            this.categorySelected.emit({ categoryId: parent.id, subCategoryId: subId });
        }
    }
}
