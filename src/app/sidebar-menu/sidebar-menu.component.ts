import { Component, AfterViewInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CommonService } from '../shared/commonService';
import { WalletConnectService } from '../services/walletconnect.service';
import { AuthorizationService } from '../services/authorization.service';
import { SidebarMenuService } from './sidebar-menu.service';
import { CategoryService } from '../shared/category.service';
import { Category } from '../shared/category.model';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PremiumUpgradeDialogComponent } from '../premium-upgrade-dialog.component';
import { CreatePredictionComponent } from '../shared/create-prediction.component';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements AfterViewInit, OnDestroy {
  isSidebarExpanded = true;
  userAddress: string = '';
  unbridBalance: number = 0;
  username: string = '';
  isAuthenticated: boolean = false;
  walletConnected: boolean = false;
  userProfileImage: string = 'https://ipfs.unbrid.com/app/user-profile.webp';
  private isDisconnecting: boolean = false;
  private subscriptions: Subscription = new Subscription();

  /** Categoría principal seleccionada desde el Header */
  activeCategory: Category | null = null;
  /** Conjunto de IDs de nodos expandidos en el árbol del sidebar */
  expandedNodeIds: Set<number> = new Set();

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private commonService: CommonService,
    private walletConnectService: WalletConnectService,
    private authorizationService: AuthorizationService,
    private sidebarMenuService: SidebarMenuService,
    private categoryService: CategoryService,
    private router: Router,
    private modalService: NgbModal
  ) {
    // Initialize authentication state
    this.isAuthenticated = this.authorizationService.isAuthenticated();

    // Check initial wallet connection
    this.checkWalletConnection();

    // Load user profile and wallet address if authenticated
    if (this.isAuthenticated) {
      this.loadUserProfile();
      this.loadWalletAddress();
    }

    // Subscribe to user address updates (legacy)
    this.subscriptions.add(
      this.commonService.updateUserAddress.subscribe(() => {
        this.userAddress = this.commonService.getAccountAddress();
        // Update authentication state when user address changes
        this.isAuthenticated = this.authorizationService.isAuthenticated();
        if (this.isAuthenticated) {
          this.loadUserProfile();
          this.loadWalletAddress();
        }
      })
    );

    // Subscribe to wallet state changes for real-time updates
    this.subscriptions.add(
      this.walletConnectService.walletState$.subscribe(state => {
        this.walletConnected = state.isConnected;

        if (state.isConnected && state.address) {
          this.userAddress = state.address;
          this.isAuthenticated = this.authorizationService.isAuthenticated();

          if (this.isAuthenticated) {
            this.loadUserProfile();
          } else {
            this.setDefaultWalletOnlyData();
          }
        } else {
          this.userAddress = '';
        }
      })
    );
    // Suscribirse a cambios de categoría desde el Header
    this.subscriptions.add(
      this.categoryService.selectedCategory$.subscribe(cat => {
        this.activeCategory = cat;
        // Al cambiar la categoría principal, expandir todos los hijos de primer nivel
        this.expandedNodeIds = new Set();
        if (cat?.children) {
          cat.children.forEach(child => this.expandedNodeIds.add(child.id));
        }
      })
    );
  }

  private loadUserProfile(): void {
    this.sidebarMenuService.getUserProfile().subscribe({
      next: (response: any) => {
        console.log("🚀 ~ SidebarMenuComponent ~ loadUserProfile ~ response:", response)
        console.log(response);
        if (response?.data) {
          this.username = response.data[0].username || '';
          this.unbridBalance = response.data[0].fierce_balance || 0;
          this.userProfileImage = response.data[0].url_avatar || 'https://api.dicebear.com/9.x/fun-emoji/svg';
        }
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
      }
    });
  }

  private setDefaultWalletOnlyData(): void {
    const randomNum = Math.floor(Math.random() * 10000);
    this.username = `User${randomNum}`;
    this.unbridBalance = 0;
    this.userProfileImage = `https://api.dicebear.com/9.x/fun-emoji/svg`;
  }

  private async checkWalletConnection(): Promise<void> {
    try {
      const address = await this.walletConnectService.getConnectedWalletAddress();
      if (address) {
        this.userAddress = address;
        this.walletConnected = true;
        this.isAuthenticated = this.authorizationService.isAuthenticated();

        if (this.isAuthenticated) {
          this.loadUserProfile();
        } else {
          this.setDefaultWalletOnlyData();
        }
      }
    } catch (error) {
      const fallbackAddress = this.commonService.getAccountAddress();
      if (fallbackAddress) {
        this.userAddress = fallbackAddress;
        this.walletConnected = true;
        this.isAuthenticated = this.authorizationService.isAuthenticated();

        if (this.isAuthenticated) {
          this.loadUserProfile();
        } else {
          this.setDefaultWalletOnlyData();
        }
      }
    }
  }

  private async loadWalletAddress(): Promise<void> {
    try {
      const address = await this.walletConnectService.getConnectedWalletAddress();
      if (address) {
        this.userAddress = address;
      }
    } catch (error) {
      // Si falla, usar el address de commonService como fallback
      this.userAddress = this.commonService.getAccountAddress() || '';
    }
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

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  /** Alterna la expansión de un nodo del árbol de subcategorías */
  toggleExpand(nodeId: number, event: Event): void {
    event.stopPropagation();
    
    // Si el nodo no tiene hijos, es una categoría final -> aplicar filtro
    const node = this.findNodeById(nodeId, this.activeCategory?.children || []);
    if (node && (!node.children || node.children.length === 0)) {
      this.categoryService.setFilterCategoryId(nodeId);
      return;
    }

    // Si tiene hijos, expandir/colapsar
    if (this.expandedNodeIds.has(nodeId)) {
      this.expandedNodeIds.delete(nodeId);
    } else {
      this.expandedNodeIds.add(nodeId);
    }
  }

  private findNodeById(id: number, nodes: Category[]): Category | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = this.findNodeById(id, node.children);
        if (found) return found;
      }
    }
    return null;
  }

  isExpanded(nodeId: number): boolean {
    return this.expandedNodeIds.has(nodeId);
  }

  openPremiumDialog() {
    const modalRef = this.modalService.open(PremiumUpgradeDialogComponent, {
      size: 'xl',
      backdrop: 'static',
      windowClass: 'full-screen-modal'
    });
  }

  openCreatePrediction() {
    const modalRef = this.modalService.open(CreatePredictionComponent, {
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
