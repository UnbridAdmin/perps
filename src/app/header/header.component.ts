import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  showMoreCategories = false;
  
  categories = [
    { name: 'Politics', active: true },
    { name: 'Sports', active: false },
    { name: 'Crypto', active: false },
    { name: 'Finance', active: false },
    { name: 'Tech', active: false },
    { name: 'Culture', active: false }
  ];

  toggleMoreCategories() {
    this.showMoreCategories = !this.showMoreCategories;
  }

  selectCategory(index: number) {
    this.categories.forEach((cat, i) => cat.active = i === index);
  }
}
