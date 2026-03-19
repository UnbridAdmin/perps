import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreatePredictionService } from './create-prediction.service';
import { CATEGORIES_TREE, Category } from '../shared/category.model';
import { FierceIntuitionComponent } from '../shared/post-prediction/components/fierce-intuition/fierce-intuition.component';
import { CustomDropdownComponent } from '../shared/custom-dropdown/custom-dropdown.component';
import { ApiServices } from '../services/api.service';
import { CommonService } from '../shared/commonService';

@Component({
  selector: 'app-create-prediction',
  standalone: true,
  imports: [CommonModule, FormsModule, FierceIntuitionComponent, CustomDropdownComponent],
  templateUrl: './create-prediction.component.html',
  styleUrls: ['./create-prediction.component.scss']
})
export class CreatePredictionComponent implements OnInit {
  @Output() balanceUpdated = new EventEmitter<void>();
  
  category: any = null;
  type: any = { value: 'binary', label: 'Binary (YES/NO)' };
  title: string = '';
  imageUrl: string = '';
  options: string[] = ['YES', 'NO'];
  isSubmitting = false;
  perpsParams: any = null;

  categories: { value: number, label: string }[] = [];
  typeOptions = [
    { value: 'binary', label: 'Binary (YES/NO)' },
    { value: 'multiple', label: 'Multiple Options' }
  ];

  constructor(
    private router: Router, 
    private createPredictionService: CreatePredictionService,
    private apiService: ApiServices,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.categories = this.flattenCategories(CATEGORIES_TREE);
    this.loadPerpsParams();
  }

  private loadPerpsParams() {
    this.apiService.getPerpsParams().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.perpsParams = response.data.params;
        }
      },
      error: (err) => {
        console.error('Error loading perps params:', err);
      }
    });
  }

  private flattenCategories(categories: Category[], prefix = ''): { value: number, label: string, displayName: string }[] {
    let result: { value: number, label: string, displayName: string }[] = [];
    for (const cat of categories) {
      // Solo agregar si no tiene children (es categoría de último nivel)
      if (!cat.children || cat.children.length === 0) {
        result.push({
          value: cat.id,
          label: prefix + cat.name,
          displayName: cat.name
        });
      } else {
        // Si tiene children, continuar recursivamente con el prefix
        if (cat.children && cat.children.length > 0) {
          result = result.concat(this.flattenCategories(cat.children, prefix + cat.name + ' > '));
        }
      }
    }
    return result;
  }

  onTypeChange() {
    const typeValue = this.type?.value || 'binary';
    if (typeValue === 'binary') {
      this.options = ['YES', 'NO'];
    } else {
      this.options = [];
    }
  }

  private getUsername(): string {
    return localStorage.getItem('username') || 'user';
  }

  getCategoryDisplay(): string {
    if (!this.category) return '';
    return this.category.displayName || '';
  }

  getDisplayOptions(): string[] {
    const typeValue = this.type?.value || 'binary';
    if (typeValue === 'binary') {
      return ['YES', 'NO'];
    } else {
      return this.options.filter(o => o.trim().length > 0);
    }
  }

  get previewPrediction(): any {
    return {
      prediction_id: 0,
      question: this.title || 'Your prediction title',
      options: this.getPreviewOptions(),
      sentimentVotes: {
        total: 0
      },
      imageUrl: this.imageUrl,
      category: this.getCategoryDisplay() || 'Category',
      participants: 0,
      creatorAvatar: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=you'
    };
  }

  private getPreviewOptions(): any[] {
    const displayOptions = this.getDisplayOptions();
    return displayOptions.map((option, index) => ({
      prediction_option_id: index,
      prediction_option_title: option,
      votes: 0,
      percentage: 0
    }));
  }

  addOption() {
    this.options.push('');
  }

  removeOption(index: number) {
    this.options.splice(index, 1);
  }

  submitPrediction() {
    const validOptions = this.options.map(o => o.trim()).filter(o => o.length > 0);

    if (!this.category || !this.title || validOptions.length === 0) {
      this.commonService.showToastMessage("Please complete the required fields: Category, Title and at least one valid Option.", 5000, 400);
      return;
    }

    this.isSubmitting = true;
    const payload = {
      categoryId: Number(this.category.value),
      type: (this.type?.value || 'binary').toUpperCase(),
      title: this.title,
      imageLink: this.imageUrl,
      options: validOptions
    };

    this.createPredictionService.createPrediction(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.commonService.showToastMessage('Prediction created successfully! Your balance has been updated.', 5000, 200);
        
        // Emit event to update balance in sidebar
        this.balanceUpdated.emit();
        this.commonService.logoutBalance.emit(true);
        
        // Redirect to user profile
        const username = this.getUsername();
        this.router.navigate(['/', username]);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error creating prediction:', err);
        this.commonService.showToastMessage('An error occurred while creating the prediction', 5000, 400);
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
