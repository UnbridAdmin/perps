import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-create-prediction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-prediction.component.html',
  styleUrls: ['./create-prediction.component.scss']
})
export class CreatePredictionComponent {
  category: string = '';
  type: 'binary' | 'multiple' = 'binary';
  title: string = '';
  imageUrl: string = '';
  options: string[] = ['YES', 'NO'];

  categories = [
    { value: 'crypto', label: 'Crypto' },
    { value: 'sports', label: 'Sports' },
    { value: 'politics', label: 'Politics' },
    { value: 'economy', label: 'Economy' }
  ];

  constructor(public activeModal: NgbActiveModal) {}

  onTypeChange() {
    if (this.type === 'binary') {
      this.options = ['YES', 'NO'];
    } else {
      this.options = [];
    }
  }

  addOption() {
    this.options.push('');
  }

  removeOption(index: number) {
    this.options.splice(index, 1);
  }

  submitPrediction() {
    // TODO: implement submission
    console.log('Prediction data:', {
      category: this.category,
      type: this.type,
      title: this.title,
      imageUrl: this.imageUrl,
      options: this.options
    });
  }

  trackByIndex(index: number): number {
    return index;
  }
}
