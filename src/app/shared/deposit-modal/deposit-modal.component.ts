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
  ) { }

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
        // Fetch FIERCE balance from wallet using ERC20 standard ABI
        const balance = await this.walletService.getERC20Balance(
          environment.DECIMALFIERCE || 18,
          environment.FIERCECONTRACTADDRESS,
          environment.ERC20_MINIMAL_ABI || environment.USDTPolyABI
        );
        
        // Validate the balance was retrieved successfully
        if (balance !== null && balance !== undefined) {
          this.fierceBalance = balance;
        } else {
          console.warn('Balance returned null or undefined, using default 0.00');
          this.fierceBalance = '0.00';
        }
      } else {
        console.warn('No wallet address connected');
        this.fierceBalance = '0.00';
      }
    } catch (error) {
      console.error('Error loading balances:', error);
      this.fierceBalance = '0.00';
      // Show user-friendly error message
      this.confirmDialogService.showError({
        title: 'Error al cargar saldo',
        message1: 'No se pudo cargar el saldo de FIERCE. Por favor, intenta de nuevo.'
      });
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
      this.sidebarMenuService.notifyBalanceUpdate(); // Notify other components to refresh balance

      // The modal closing and success message should be coordinated
      await this.confirmDialogService.showSuccess({
        title: 'Depósito exitoso',
        message1: `Tu depósito de ${this.amount} FIERCE ha sido acreditado.`
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
