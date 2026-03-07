import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Category, CATEGORIES_TREE } from './category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
    /** Categoría principal activa (null = ninguna seleccionada) */
    private selectedCategorySubject = new BehaviorSubject<Category | null>(null);
    selectedCategory$ = this.selectedCategorySubject.asObservable();

    /** Árbol completo disponible para el header */
    readonly tree: Category[] = CATEGORIES_TREE;

    selectCategory(category: Category | null): void {
        this.selectedCategorySubject.next(category);
    }

    clearSelection(): void {
        this.selectedCategorySubject.next(null);
    }
}
