import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotemsMetricsComponent } from './totems-metrics.component';

describe('TotemsMetricsComponent', () => {
  let component: TotemsMetricsComponent;
  let fixture: ComponentFixture<TotemsMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotemsMetricsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotemsMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
