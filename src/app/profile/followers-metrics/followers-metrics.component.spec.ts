import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowersMetricsComponent } from './followers-metrics.component';

describe('FollowersMetricsComponent', () => {
  let component: FollowersMetricsComponent;
  let fixture: ComponentFixture<FollowersMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowersMetricsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowersMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
