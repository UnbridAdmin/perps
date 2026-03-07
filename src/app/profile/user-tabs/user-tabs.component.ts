import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostPredictionComponent } from '../../shared/post-prediction/post-prediction.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-tabs',
  standalone: true,
  imports: [
    CommonModule,
    PostPredictionComponent
  ],
  templateUrl: './user-tabs.component.html',
  styleUrl: './user-tabs.component.scss'
})
export class UserTabsComponent {
  activeTab: string = 'predictions';
  @Input() userId?: number;

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
