import { Component, Input, Output, EventEmitter, TemplateRef, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-dropdown.component.html',
  styleUrls: ['./custom-dropdown.component.scss']
})
export class CustomDropdownComponent {
  @Input() options: any[] = [];
  @Input() selectedItem: any;
  @Input() placeholder: string = 'Seleccionar...';
  @Input() displayKey: string = 'label';
  @Input() valueKey: string = 'value';
  @Input() selectedTemplate: TemplateRef<any> | null = null;
  @Input() itemTemplate: TemplateRef<any> | null = null;

  @Output() selectedItemChange = new EventEmitter<any>();

  isOpen = false;

  constructor(private elementRef: ElementRef) {}

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  selectItem(item: any) {
    this.selectedItem = item;
    this.selectedItemChange.emit(item);
    this.closeDropdown();
  }

  isItemSelected(item: any): boolean {
    if (!this.selectedItem) return false;
    return this.selectedItem === item || this.selectedItem[this.valueKey] === item[this.valueKey];
  }

  getDisplayValue(item: any): string {
    if (!item) return '';
    if (typeof item === 'string' || typeof item === 'number') return String(item);
    return item[this.displayKey] || '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}
