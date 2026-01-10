import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  @Input() image_icon: string = '';
  @Input() title: string = '';
  @Input() message1: string = '';
  @Input() message2: string = '';
  @Input() message3: string = '';
  @Input() disableClose: boolean = false;
  @Input() leftButton: string = "Cancelar";
  @Input() rightButton: string = "Aceptar";
  @Output() emitSuccess: EventEmitter<any> = new EventEmitter();
  @Output() emitCancel: EventEmitter<any> = new EventEmitter();
  @Input() leftButtonActive: boolean = true;
  @Input() rightButtonActive: boolean = true;

  constructor() {}

  cancel() {
    this.emitCancel.emit(true);
  }

  accept() {
    this.emitSuccess.emit(true);
  }

  closeModal() {
    // Emitir cancel para cerrar el modal
    this.emitCancel.emit(true);
  }
}