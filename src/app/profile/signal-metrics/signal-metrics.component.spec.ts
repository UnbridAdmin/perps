import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalMetricsComponent } from './signal-metrics.component';

describe('SignalMetricsComponent', () => {
  let component: SignalMetricsComponent;
  let fixture: ComponentFixture<SignalMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalMetricsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SignalMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
