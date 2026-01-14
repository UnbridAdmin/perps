import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EarningsMetricsComponent } from './earnings-metrics.component';

describe('EarningsMetricsComponent', () => {
  let component: EarningsMetricsComponent;
  let fixture: ComponentFixture<EarningsMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EarningsMetricsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EarningsMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
