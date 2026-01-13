import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Character } from '../models/character.model';

@Component({
  selector: 'app-fierce-guardian-character',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fierce-guardian-character.component.html',
  styleUrls: ['./fierce-guardian-character.component.scss']
})
export class FierceGuardianCharacterComponent {
  @Input() character: Character | null = null;

  constructor(public activeModal: NgbActiveModal) {}

  closeDialog() {
    this.activeModal.close();
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('es-ES').format(num);
  }
}
