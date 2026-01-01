import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() tabChange = new EventEmitter<'for-you' | 'trending'>();

  showMoreCategories = false;
  activeTab: 'for-you' | 'trending' = 'for-you';

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

  setActiveTab(tab: 'for-you' | 'trending') {
    this.activeTab = tab;
    this.tabChange.emit(tab);
  }
}
