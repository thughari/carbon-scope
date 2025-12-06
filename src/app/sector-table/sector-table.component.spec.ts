import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectorTableComponent } from './sector-table.component';

describe('SectorTableComponent', () => {
  let component: SectorTableComponent;
  let fixture: ComponentFixture<SectorTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectorTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectorTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
