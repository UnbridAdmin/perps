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

  // Precio actual del token Fierce
  readonly FIERCE_TOKEN_PRICE = 0.0033; // USD

  constructor(public activeModal: NgbActiveModal) {}

  closeDialog() {
    this.activeModal.close();
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('es-ES').format(num);
  }

  formatCurrency(num: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(num);
  }

  getDailyEarningsUSD(): number {
    if (!this.character?.dailyBase) return 0;
    return this.character.dailyBase * this.FIERCE_TOKEN_PRICE;
  }

  getMonthlyEarningsUSD(): number {
    return this.getDailyEarningsUSD() * 30;
  }

  getYearlyEarningsUSD(): number {
    return this.getDailyEarningsUSD() * 365;
  }

  getPotentialMultiplier(): string {
    if (!this.character?.multiplier) return '1x';
    return `${this.character.multiplier}x`;
  }

  getPersuasiveMessage(): string {
    if (!this.character) return '';

    const earnings = this.getDailyEarningsUSD();
    if (earnings >= 1) {
      return `¡WOOO! Ganarás ${this.formatCurrency(earnings)} diarios solo con este personaje!`;
    } else {
      return `¡Increíble! ${this.formatNumber(this.character.dailyBase)} tokens diarios que valen ${this.formatCurrency(earnings)}`;
    }
  }

  getInvestmentMessage(): string {
    if (!this.character) return '';

    const monthly = this.getMonthlyEarningsUSD();
    const yearly = this.getYearlyEarningsUSD();

    return `Con ${this.character.multiplier}x de poder, ganarás ${this.formatCurrency(monthly)} al mes y ${this.formatCurrency(yearly)} al año`;
  }
}
