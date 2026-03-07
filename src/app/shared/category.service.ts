import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Category, CATEGORIES_TREE } from './category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
    /** Categoría principal activa (null = ninguna seleccionada) */
    private selectedCategorySubject = new BehaviorSubject<Category | null>(null);
    selectedCategory$ = this.selectedCategorySubject.asObservable();

    /** ID de categoría para filtrar predicciones (null = sin filtro) */
    private filterCategoryIdSubject = new BehaviorSubject<number | null>(null);
    filterCategoryId$ = this.filterCategoryIdSubject.asObservable();

    /** IDs de nodos que deben expandirse en el sidebar */
    private expandedNodeIdsSubject = new BehaviorSubject<number[]>([]);
    expandedNodeIds$ = this.expandedNodeIdsSubject.asObservable();

    /** Árbol completo disponible para el header */
    readonly tree: Category[] = CATEGORIES_TREE;

    selectCategory(category: Category | null): void {
        this.selectedCategorySubject.next(category);
    }

    setFilterCategoryId(categoryId: number | null): void {
        this.filterCategoryIdSubject.next(categoryId);
    }

    setExpandedNodeIds(nodeIds: number[]): void {
        this.expandedNodeIdsSubject.next(nodeIds);
    }

    clearSelection(): void {
        this.selectedCategorySubject.next(null);
        this.filterCategoryIdSubject.next(null);
        this.expandedNodeIdsSubject.next([]);
    }
}
