import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeDetailComponent } from './trade-detail.component';

describe('TradeDetailComponent', () => {
  let component: TradeDetailComponent;
  let fixture: ComponentFixture<TradeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradeDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TradeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
