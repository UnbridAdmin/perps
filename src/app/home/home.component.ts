import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PostPredictionComponent } from '../shared/post-prediction/post-prediction.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PostPredictionComponent],
  template: `<app-post-prediction [tab]="tab"></app-post-prediction>`,
  styles: []
})
export class HomeComponent implements OnInit {
  tab: 'for-you' | 'trending' = 'for-you';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.tab = params['tab'];
      }
    });
  }
}
