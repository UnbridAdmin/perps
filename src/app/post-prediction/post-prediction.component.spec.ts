import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostPredictionComponent } from './post-prediction.component';

describe('PostPredictionComponent', () => {
  let component: PostPredictionComponent;
  let fixture: ComponentFixture<PostPredictionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostPredictionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostPredictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
