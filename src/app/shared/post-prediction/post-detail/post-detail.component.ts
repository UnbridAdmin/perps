import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PostPredictionComponent } from '../post-prediction.component';
import { PostCommentsComponent } from '../components/post-comments/post-comments.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, PostPredictionComponent, PostCommentsComponent],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss']
})
export class PostDetailComponent implements OnInit {
  predictionId: number | null = null;
  currentPrediction: any = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.predictionId = +params['id'];
    });
  }

  handlePredictionLoaded(prediction: any) {
    this.currentPrediction = prediction;
  }
}
