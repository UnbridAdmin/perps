import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyPredictionsComponent } from '../my-predictions/my-predictions.component';
import { SignalsContainerComponent } from '../signals/signals-container/signals-container.component';

@Component({
  selector: 'app-user-tabs',
  standalone: true,
  imports: [
    CommonModule,
    MyPredictionsComponent,
    SignalsContainerComponent
  ],
  templateUrl: './user-tabs.component.html',
  styleUrl: './user-tabs.component.scss'
})
export class UserTabsComponent {
  activeTab: string = 'predictions';

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
