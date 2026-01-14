import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Character, ProjectPhase } from '../models/character.model';

@Component({
  selector: 'app-fierce-guardian-character',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fierce-guardian-character.component.html',
  styleUrls: ['./fierce-guardian-character.component.scss']
})
export class FierceGuardianCharacterComponent {
  @Input()
  set character(value: Character | null) {
    this._character = value;
    if (value) {
      console.log('Character received:', value);
      console.log('Character multiplier:', value.multiplier);
      console.log('Character dailyBase:', value.dailyBase);
    }
  }
  get character(): Character | null {
    return this._character;
  }
  private _character: Character | null = null;

  // Fases del proyecto
  projectPhases: ProjectPhase[] = [
    {
      id: 1,
      name: 'Fase 1',
      roiMultiplier: 1.5,
      tokenPrice: 0.0033,
      isCurrentPhase: true,
       packageData: {
        1: { cost: 2.00, monthlyTokens: 3429 },
        5: { cost: 10.00, monthlyTokens: 17143 },
        10: { cost: 20.00, monthlyTokens: 34286 },
        25: { cost: 50.00, monthlyTokens: 85714 },
        50: { cost: 100.00, monthlyTokens: 171429 }
      }
    },
    {
      id: 2,
      name: 'Fase 2',
      roiMultiplier: 1.3,
      tokenPrice: 0.0033,
      isCurrentPhase: false,
      packageData: {
        1: { cost: 2.00, monthlyTokens: 3030 },
        5: { cost: 10.00, monthlyTokens: 15152 },
        10: { cost: 20.00, monthlyTokens: 30303 },
        25: { cost: 50.00, monthlyTokens: 75758 },
        50: { cost: 100.00, monthlyTokens: 151515 }
      }
    },
    {
      id: 3,
      name: 'Fase 3',
      roiMultiplier: 1.2,
      tokenPrice: 0.0033,
      isCurrentPhase: false,
      packageData: {
        1: { cost: 2.00, monthlyTokens: 2952 },
        5: { cost: 10.00, monthlyTokens: 14762 },
        10: { cost: 20.00, monthlyTokens: 29524 },
        25: { cost: 50.00, monthlyTokens: 73810 },
        50: { cost: 100.00, monthlyTokens: 147619 }
      }
    },
    {
      id: 4,
      name: 'Fase 4',
      roiMultiplier: 1.1,
      tokenPrice: 0.0033,
      isCurrentPhase: false,
      packageData: {
        1: { cost: 2.00, monthlyTokens: 2476 },
        5: { cost: 10.00, monthlyTokens: 12381 },
        10: { cost: 20.00, monthlyTokens: 24762 },
        25: { cost: 50.00, monthlyTokens: 61905 },
        50: { cost: 100.00, monthlyTokens: 123810 }
      }
    },
    {
      id: 5,
      name: 'Fase 5',
      roiMultiplier: 1.05,
      tokenPrice: 0.0033,
      isCurrentPhase: false,
      packageData: {
        1: { cost: 2.00, monthlyTokens: 1714 },
        5: { cost: 10.00, monthlyTokens: 8571 },
        10: { cost: 20.00, monthlyTokens: 17143 },
        25: { cost: 50.00, monthlyTokens: 42857 },
        50: { cost: 100.00, monthlyTokens: 85714 }
      }
    }
  ];

  selectedPhase: ProjectPhase = this.projectPhases[0]; // Fase 1 por defecto

  constructor(public activeModal: NgbActiveModal) {}

  // Método para cambiar la fase actual (usar desde configuración/admin)
  setCurrentPhase(phaseId: number) {
    this.projectPhases.forEach(phase => {
      phase.isCurrentPhase = phase.id === phaseId;
    });

    // Si la fase seleccionada ya no es actual, mantener la selección pero mostrar indicador
    if (!this.selectedPhase.isCurrentPhase) {
      // Mantener la selección actual del usuario
    }
  }

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

  // Getters para el precio del token basado en la fase seleccionada
  getCurrentTokenPrice(): number {
    return this.selectedPhase.tokenPrice;
  }

  getPackageData() {
    if (!this.character?.multiplier) return null;
    return this.selectedPhase.packageData[this.character.multiplier];
  }

  getDailyTokens(): number {
    const packageData = this.getPackageData();
    if (packageData) {
      // Si tenemos datos del paquete, usar monthlyTokens / 30
      return Math.round(packageData.monthlyTokens / 30);
    } else if (this.character?.dailyBase) {
      // Si no tenemos datos del paquete, usar dailyBase del character
      return this.character.dailyBase;
    }
    return 0;
  }

  getMonthlyTokens(): number {
    const packageData = this.getPackageData();
    if (packageData) {
      // Si tenemos datos del paquete, usar monthlyTokens
      return packageData.monthlyTokens;
    } else if (this.character?.dailyBase) {
      // Si no tenemos datos del paquete, calcular monthlyTokens = dailyBase * 30
      return this.character.dailyBase * 30;
    }
    return 0;
  }

  getDailyEarningsUSD(): number {
    return this.getDailyTokens() * this.getCurrentTokenPrice();
  }

  getMonthlyEarningsUSD(): number {
    const packageData = this.getPackageData();
    if (packageData) {
      // Calcular ganancias mensuales: monthlyTokens * tokenPrice
      return packageData.monthlyTokens * this.getCurrentTokenPrice();
    } else {
      // Fallback: dailyEarnings * 30
      return this.getDailyEarningsUSD() * 30;
    }
  }

  getYearlyEarningsUSD(): number {
    return this.getMonthlyEarningsUSD() * 12;
  }

  getPotentialMultiplier(): string {
    if (!this.character?.multiplier) return '1x';
    return `${this.character.multiplier}x`;
  }

  getPersuasiveMessage(): string {
    if (!this.character) return '';

    const monthlyEarnings = this.getMonthlyEarningsUSD();
    if (monthlyEarnings >= 1) {
      return `¡WOOO! Ganarás ${this.formatCurrency(monthlyEarnings)} mensuales con este personaje!`;
    } else {
      const dailyTokens = this.getDailyTokens();
      return `¡Increíble! ${this.formatNumber(dailyTokens)} tokens diarios que valen ${this.formatCurrency(this.getDailyEarningsUSD())}`;
    }
  }

  getInvestmentMessage(): string {
    if (!this.character) return '';

    const monthly = this.getMonthlyEarningsUSD();
    const yearly = this.getYearlyEarningsUSD();

    return `Con ${this.character.multiplier}x de podrías, ganar ${this.formatCurrency(monthly)} al mes y ${this.formatCurrency(yearly)} al año`;
  }

  onPhaseChange() {
    // El cambio se refleja automáticamente en los cálculos
  }

  getRoundedDailyTokens(): number {
    return Math.round(this.getDailyTokens());
  }
}
