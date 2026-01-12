import { Component, AfterViewInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CommonService } from '../shared/commonService';
import { WalletConnectService } from '../services/walletconnect.service';
import { AuthorizationService } from '../services/authorization.service';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PremiumUpgradeDialogComponent } from '../premium-upgrade-dialog.component';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements AfterViewInit, OnDestroy {
  isSidebarExpanded = true;
  userAddress: string = '';
  private isDisconnecting: boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private commonService: CommonService,
    private walletConnectService: WalletConnectService,
    private authorizationService: AuthorizationService,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.subscriptions.add(
      this.commonService.updateUserAddress.subscribe(() => {
        this.userAddress = this.commonService.getAccountAddress();
      })
    );
  }

  ngAfterViewInit() {
    const arrows = this.el.nativeElement.querySelectorAll('.arrow');
    arrows.forEach((arrow: any) => {
      arrow.addEventListener('click', (e: Event) => {
        const arrowParent = (e.target as HTMLElement).parentElement!.parentElement;
        arrowParent!.classList.toggle('showMenu');
      });
    });
  }

  toggleSidebar() {
    this.isSidebarExpanded = !this.isSidebarExpanded;
    const sidebar = this.el.nativeElement.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed');
      // Agregar/remover clase al documento para que otros componentes se adapten
      if (sidebar.classList.contains('collapsed')) {
        this.renderer.addClass(document.documentElement, 'sidebar-collapsed');
      } else {
        this.renderer.removeClass(document.documentElement, 'sidebar-collapsed');
      }
    }
  }

  truncateAddress(address: string): string {
    if (!address) return 'Not Connected';
    return address.slice(0, 6) + '...' + address.slice(-4);
  }

  openPremiumDialog() {
    const modalRef = this.modalService.open(PremiumUpgradeDialogComponent, {
      size: 'xl',
      backdrop: 'static',
      windowClass: 'full-screen-modal'
    });
  }

  async disconnectWallet(): Promise<void> {
    this.isDisconnecting = true;

    // Clear all storage
    this.clearAllStorage();

    // Clear application state
    this.clearApplicationState();

    setTimeout(async () => {
      await this.logout();

      // Navigate to login after logout
      this.router.navigate(['/login']);

      this.isDisconnecting = false;
      console.log("✅ Wallet disconnection completed");
    }, 100);
  }

  private clearAllStorage(): void {
    sessionStorage.clear();
    const keysToRemove = ['expirationDate', 'signatureData', 'accountAddress'];
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  private clearApplicationState(): void {
    this.commonService.saveAccountAddress('');
    this.userAddress = '';
  }

  private async logout(): Promise<void> {
    try {
      // Logout from backend if authenticated
      if (this.authorizationService.isAuthenticated()) {
        await this.authorizationService.logout().toPromise();
      }

      // Disconnect wallet using AppKit
      const web3Modal = this.walletConnectService.getWeb3Modal();
      if (web3Modal) {
        // Close modal if open
        if (web3Modal.getIsConnected()) {
          await web3Modal.disconnect();
        }
      }

      // Force close any open modals
      const modalElements = document.querySelectorAll('[role="dialog"], .w3m-modal, .wallet-modal');
      modalElements.forEach(element => {
        (element as HTMLElement).style.display = 'none';
      });

      // Additional cleanup for AppKit
      if (web3Modal && typeof web3Modal.close === 'function') {
        web3Modal.close();
      }
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
