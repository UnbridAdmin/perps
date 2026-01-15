import { Component, EventEmitter, Output, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from '../shared/commonService';
import { WalletConnectService } from '../services/walletconnect.service';
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
  private subscriptions: Subscription = new Subscription();

  categories = [
    { name: 'Politics', active: true },
    { name: 'Sports', active: false },
    { name: 'Crypto', active: false },
    { name: 'Finance', active: false },
    { name: 'Tech', active: false },
    { name: 'Culture', active: false }
  ];

  constructor(private commonService: CommonService, private walletConnectService: WalletConnectService) {}

  ngOnInit() {
    // Subscribe to user address updates (legacy)
    this.subscriptions.add(
      this.commonService.updateUserAddress.subscribe(() => {
        this.userAddress = this.commonService.getAccountAddress();
      })
    );

    // Subscribe to wallet state changes for real-time updates
    this.subscriptions.add(
      this.walletConnectService.walletState$.subscribe(state => {
        if (state.isConnected && state.address) {
          this.userAddress = state.address;
        } else {
          this.userAddress = '';
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleMoreCategories() {
    this.showMoreCategories = !this.showMoreCategories;
  }

  selectCategory(index: number) {
    this.categories.forEach((cat, i) => cat.active = i === index);
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
}
