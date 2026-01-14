import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccuracyMetricsComponent } from './accuracy-metrics.component';

describe('AccuracyMetricsComponent', () => {
  let component: AccuracyMetricsComponent;
  let fixture: ComponentFixture<AccuracyMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccuracyMetricsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccuracyMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
