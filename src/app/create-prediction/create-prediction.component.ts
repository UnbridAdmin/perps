import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreatePredictionService } from './create-prediction.service';
import { CATEGORIES_TREE, Category } from '../shared/category.model';

@Component({
  selector: 'app-create-prediction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-prediction.component.html',
  styleUrls: ['./create-prediction.component.scss']
})
export class CreatePredictionComponent implements OnInit {
  category: number | '' = '';
  type: 'binary' | 'multiple' = 'binary';
  title: string = '';
  imageUrl: string = '';
  options: string[] = ['YES', 'NO'];
  isSubmitting = false;

  categories: { value: number, label: string }[] = [];

  constructor(private router: Router, private createPredictionService: CreatePredictionService) {}

  ngOnInit() {
    this.categories = this.flattenCategories(CATEGORIES_TREE);
  }

  private flattenCategories(categories: Category[], prefix = ''): { value: number, label: string }[] {
    let result: { value: number, label: string }[] = [];
    for (const cat of categories) {
      result.push({ value: cat.id, label: prefix + cat.name });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(this.flattenCategories(cat.children, prefix + '-- '));
      }
    }
    return result;
  }

  onTypeChange() {
    if (this.type === 'binary') {
      this.options = ['YES', 'NO'];
    } else {
      this.options = [];
    }
  }

  getCategoryDisplay(): string {
    if (this.category === '') return '';
    const found = this.categories.find(c => c.value === Number(this.category));
    return found ? found.label.replace('-- ', '').trim() : '';
  }

  addOption() {
    this.options.push('');
  }

  removeOption(index: number) {
    this.options.splice(index, 1);
  }

  submitPrediction() {
    const validOptions = this.options.map(o => o.trim()).filter(o => o.length > 0);
    
    if (this.category === '' || !this.title || validOptions.length === 0) {
      alert("Por favor completa los campos obligatorios: Categoría, Título y al menos una Opción válida.");
      return;
    }

    this.isSubmitting = true;
    const payload = {
      categoryId: Number(this.category),
      type: this.type.toUpperCase(),
      title: this.title,
      imageLink: this.imageUrl,
      options: validOptions
    };

    this.createPredictionService.createPrediction(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        alert('Predicción creada exitosamente');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error creando predicción:', err);
        alert('Ocurrió un error al crear la predicción');
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
