import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectorChartsComponent } from './sector-charts.component';

describe('SectorChartsComponent', () => {
  let component: SectorChartsComponent;
  let fixture: ComponentFixture<SectorChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectorChartsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectorChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
