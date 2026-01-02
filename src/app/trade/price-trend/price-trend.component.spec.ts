import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceTrendComponent } from './price-trend.component';

describe('PriceTrendComponent', () => {
  let component: PriceTrendComponent;
  let fixture: ComponentFixture<PriceTrendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceTrendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
