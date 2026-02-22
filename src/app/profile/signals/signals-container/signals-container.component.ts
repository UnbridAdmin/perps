import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalsNavComponent } from '../signals-nav/signals-nav.component';
import { SignalsListComponent } from '../signals-list/signals-list.component';
import { SignalsService } from '../../../services/signals.service';
import { Signal, Category } from '../../../shared/models/signal.model';

@Component({
    selector: 'app-signals-container',
    standalone: true,
    imports: [CommonModule, SignalsNavComponent, SignalsListComponent],
    templateUrl: './signals-container.component.html',
    styleUrl: './signals-container.component.scss'
})
export class SignalsContainerComponent implements OnInit {
    categories: Category[] = [];
    signals: Signal[] = [];
    loading: boolean = false;
    selectedCategoryId: string | null = null;
    selectedSubCategoryId: string | null = null;

    constructor(private signalsService: SignalsService) { }

    ngOnInit() {
        this.loadCategories();
        this.loadSignals();
    }

    loadCategories() {
        this.signalsService.getCategories().subscribe(categories => {
            this.categories = categories;
        });
    }

    loadSignals(categoryId?: string, subCategoryId?: string) {
        this.loading = true;
        this.signalsService.getSignals(categoryId, subCategoryId).subscribe(signals => {
            this.signals = signals;
            this.loading = false;
        });
    }

    onCategorySelected(event: { categoryId: string, subCategoryId?: string }) {
        this.selectedCategoryId = event.categoryId;
        this.selectedSubCategoryId = event.subCategoryId || null;
        this.loadSignals(this.selectedCategoryId, this.selectedSubCategoryId);
    }
}
