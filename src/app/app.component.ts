import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarMenuComponent } from './sidebar-menu/sidebar-menu.component';
import { PostPredictionComponent } from './post-prediction/post-prediction.component';
import { NewsComponent } from './news/news.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarMenuComponent, PostPredictionComponent, NewsComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  host: {
    'class': 'app-container'
  }
})
export class AppComponent {
  title = 'perps';
  activeTab: 'for-you' | 'trending' = 'for-you';

  onTabChange(tab: 'for-you' | 'trending') {
    this.activeTab = tab;
  }
}
