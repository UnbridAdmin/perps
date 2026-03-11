import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WalletConnectService } from '../../services/walletconnect.service';
import { DepositService } from '../../services/deposit.service';
import { ConfirmDialogService } from '../confirm-dialog/confirm-dialog.service';
import { environment } from '../../../environments/environment';

import { SidebarMenuService } from '../../sidebar-menu/sidebar-menu.service';

@Component({
  selector: 'app-deposit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deposit-modal.component.html',
  styleUrls: ['./deposit-modal.component.scss']
})
export class DepositModalComponent implements OnInit {
  selectedMethod: string = 'fierce';
  amount: string = '';
  isProcessing: boolean = false;
  fierceBalance: string = '0.00';
  unbridBalance: string = '0.00'; // Platform balance

  constructor(
    public activeModal: NgbActiveModal,
    private walletService: WalletConnectService,
    private depositService: DepositService,
    private confirmDialogService: ConfirmDialogService,
    private sidebarMenuService: SidebarMenuService
  ) {}

  async ngOnInit() {
    await this.loadBalances();
    this.loadPlatformBalance();
  }

  loadPlatformBalance() {
    this.sidebarMenuService.getUserProfile().subscribe({
      next: (response: any) => {
        if (response?.data) {
          this.unbridBalance = response.data[0].fierce_balance || '0.00';
        }
      }
    });
  }

  async loadBalances() {
    try {
      const address = await this.walletService.getConnectedWalletAddress();
      if (address) {
        // Fetch FIERCE balance from wallet
        const balance = await this.walletService.getERC20Balance(
          environment.DECIMALFIERCE || 18,
          environment.FIERCECONTRACTADDRESS,
          environment.USDTPolyABI
        );
        this.fierceBalance = balance || '0.00';
      }
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  }

  setAmount(percent: number) {
    const bal = parseFloat(this.fierceBalance);
    if (!isNaN(bal)) {
      this.amount = (bal * (percent / 100)).toFixed(2);
    }
  }

  async confirmDeposit() {
    if (!this.amount || parseFloat(this.amount) <= 0) {
      this.confirmDialogService.showError({
        title: 'Monto inválido',
        message1: 'Por favor ingrese un monto válido de FIERCE.'
      });
      return;
    }

    if (parseFloat(this.amount) > parseFloat(this.fierceBalance)) {
      this.confirmDialogService.showError({
        title: 'Saldo insuficiente',
        message1: 'No tienes suficiente FIERCE en tu billetera.'
      });
      return;
    }

    this.isProcessing = true;
    try {
      await this.depositService.depositFierce(this.amount);
      
      this.isProcessing = false;
      await this.confirmDialogService.showSuccess({
        title: 'Depósito exitoso',
        message1: `Tu depósito de ${this.amount} FIERCE ha sido enviado y está siendo procesado.`
      });
      this.activeModal.close(true);
    } catch (error: any) {
      this.isProcessing = false;
      console.error('Deposit error:', error);
      this.confirmDialogService.showError({
        title: 'Error en depósito',
        message1: error.message || 'Hubo un problema al procesar tu depósito.'
      });
    }
  }

  close() {
    this.activeModal.dismiss();
  }
}
