import { Component, EventEmitter, Output, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CommonService } from '../shared/commonService';
import { WalletConnectService } from '../services/walletconnect.service';
import { AuthorizationService } from '../services/authorization.service';
import { CategoryService } from '../shared/category.service';
import { Category, CATEGORIES_TREE } from '../shared/category.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() tabChange = new EventEmitter<'for-you' | 'trending'>();
  @Input() isHomePage = true;

  showMoreCategories = false;
  activeTab: 'for-you' | 'trending' = 'for-you';
  userAddress: string = '';
  isAuthenticated: boolean = false;
  walletConnected: boolean = false;
  private subscriptions: Subscription = new Subscription();

  /** Árbol completo de categorías para el header */
  categories: Category[] = CATEGORIES_TREE;
  activeCategoryId: number | null = null;

  constructor(
    private commonService: CommonService,
    private walletConnectService: WalletConnectService,
    private authorizationService: AuthorizationService,
    private categoryService: CategoryService,
    private router: Router
  ) { }

  ngOnInit() {
    // Inicializar estado de autenticación y dirección
    this.isAuthenticated = this.authorizationService.isAuthenticated();
    this.checkInitialWalletState();

    // Subscribe to user address updates
    this.subscriptions.add(
      this.commonService.updateUserAddress.subscribe(() => {
        this.isAuthenticated = this.authorizationService.isAuthenticated();
        this.userAddress = this.commonService.getAccountAddress() || '';
      })
    );

    // Subscribe to wallet state changes
    this.subscriptions.add(
      this.walletConnectService.walletState$.subscribe(state => {
        this.walletConnected = state.isConnected;

        if (state.isConnected && state.address) {
          this.userAddress = state.address;
        } else {
          this.userAddress = '';
        }

        this.isAuthenticated = this.authorizationService.isAuthenticated();
      })
    );

    // Subscribe to logout events
    this.subscriptions.add(
      this.authorizationService.logoutEvent.subscribe(() => {
        console.log('📡 Header received logout event');
        this.userAddress = '';
        this.walletConnected = false;
        this.isAuthenticated = false;
        console.log('✅ Header state after logout:', {
          userAddress: this.userAddress,
          walletConnected: this.walletConnected,
          isAuthenticated: this.isAuthenticated
        });
      })
    );

    // Subscribe to category changes from CategoryService
    this.subscriptions.add(
      this.categoryService.selectedCategory$.subscribe(category => {
        this.activeCategoryId = category?.id || null;
      })
    );
  }

  private async checkInitialWalletState(): Promise<void> {
    try {
      const address = await this.walletConnectService.getConnectedWalletAddress();
      if (address) {
        this.userAddress = address;
        this.walletConnected = true;
      }
    } catch (error) {
      this.userAddress = this.commonService.getAccountAddress() || '';
      this.walletConnected = !!this.userAddress;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleMoreCategories() {
    this.showMoreCategories = !this.showMoreCategories;
  }

  selectCategory(index: number) {
    const cat = this.categories[index];
    if (!cat) return;

    // Si no estamos en home, redirigir primero
    const currentUrl = this.router.url;
    if (currentUrl !== '/home' && currentUrl !== '/') {
      this.router.navigate(['/home']).then(() => {
        // Después de navegar, seleccionar la categoría
        this.activeCategoryId = cat.id;
        this.categoryService.selectCategory(cat);
      });
      return;
    }

    // Toggle: si ya estaba activa, deseleccionar
    if (this.activeCategoryId === cat.id) {
      this.activeCategoryId = null;
      this.categoryService.clearSelection();
    } else {
      this.activeCategoryId = cat.id;
      this.categoryService.selectCategory(cat);
    }
  }

  setActiveTab(tab: 'for-you' | 'trending') {
    this.activeTab = tab;
    this.tabChange.emit(tab);
  }

  truncateAddress(address: string): string {
    if (!address) return '';
    return address.slice(0, 6) + '...' + address.slice(-4);
  }

  async login() {
    const web3Modal = this.walletConnectService.getWeb3Modal();
    await web3Modal.open();
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
}
