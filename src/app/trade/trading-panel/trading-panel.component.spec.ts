import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradingPanelComponent } from './trading-panel.component';

describe('TradingPanelComponent', () => {
  let component: TradingPanelComponent;
  let fixture: ComponentFixture<TradingPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradingPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TradingPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
