import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DepositModalComponent } from '../../../shared/deposit-modal/deposit-modal.component';
import { WalletConnectService } from '../../../services/walletconnect.service';
import { SidebarMenuService } from '../../../sidebar-menu/sidebar-menu.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-balance-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './balance-overview.component.html',
  styleUrls: ['./balance-overview.component.scss']
})
export class BalanceOverviewComponent {
  @Input() portfolioValue: number = 0;
  @Input() dailyChange: number = 0;
  @Input() availableToTrade: number = 0;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private modalService: NgbModal,
    private walletService: WalletConnectService,
    private sidebarMenuService: SidebarMenuService
  ) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.sidebarMenuService.getUserProfile().subscribe({
      next: (response: any) => {
        if (response?.data) {
          this.availableToTrade = response.data[0].fierce_balance || 0;
          this.portfolioValue = this.availableToTrade; // For now
        }
      }
    });
  }

  onDeposit() {
    const modalRef = this.modalService.open(DepositModalComponent, {
      centered: true,
      size: 'md',
      windowClass: 'dark-modal'
    });

    modalRef.result.then((result) => {
      if (result) {
        this.fetchData(); // Refresh data after deposit
      }
    }, () => {});
  }

  onWithdraw() {
    console.log('Withdraw');
  }
}
