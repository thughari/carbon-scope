import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderStatsComponent } from './header-stats.component';

describe('HeaderStatsComponent', () => {
  let component: HeaderStatsComponent;
  let fixture: ComponentFixture<HeaderStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderStatsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render "--" and "Data Unavailable" badge when dataSourceStatus is DATA_UNAVAILABLE', () => {
    component.dataSourceStatus = 'DATA_UNAVAILABLE';
    component.totalEmissions = 0;
    component.globalTotal = 0;
    component.perCapita = null;
    component.highestSector = '';
    component.ngOnChanges();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Data Unavailable');
    expect(compiled.textContent).toContain('--');
    expect(compiled.textContent).toContain('No observations');
  });

  it('should render "--" and "Unmapped" for per-capita metric when perCapita is null', () => {
    component.dataSourceStatus = 'LIVE_API_OBSERVATION';
    component.totalEmissions = 250;
    component.globalTotal = 57582;
    component.perCapita = null;
    component.ngOnChanges();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Unmapped');
  });

  it('should render "Partial Year (YTD)" and "Live Satellite (Partial YTD)" for 2026 reporting year', () => {
    component.dataSourceStatus = 'LIVE_API_OBSERVATION';
    component.yearRange = [2015, 2026];
    component.temporalCompleteness = 'PARTIAL_YEAR_OBSERVATION';
    component.isPartialOrProvisional = true;
    component.totalEmissions = 2482;
    component.globalTotal = 33739;
    component.perCapita = 1.8;
    component.ngOnChanges();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Partial Year (YTD)');
    expect(compiled.textContent).toContain('Live Satellite (Partial YTD)');
  });

  it('should render "Provisional" badge for 2025 provisional reporting year', () => {
    component.dataSourceStatus = 'LIVE_API_OBSERVATION';
    component.yearRange = [2015, 2025];
    component.temporalCompleteness = 'PROVISIONAL_ANNUAL';
    component.isPartialOrProvisional = true;
    component.totalEmissions = 4182;
    component.globalTotal = 57794;
    component.perCapita = 2.0;
    component.ngOnChanges();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Provisional');
    expect(compiled.textContent).toContain('Live Satellite (Provisional)');
  });

  it('should render standard "Live Satellite" badge for consolidated annual year (2024)', () => {
    component.dataSourceStatus = 'LIVE_API_OBSERVATION';
    component.yearRange = [2015, 2024];
    component.temporalCompleteness = 'CONSOLIDATED_ANNUAL';
    component.isPartialOrProvisional = false;
    component.totalEmissions = 4165;
    component.globalTotal = 57582;
    component.perCapita = 2.0;
    component.ngOnChanges();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Live Satellite');
    expect(compiled.textContent).not.toContain('Partial Year (YTD)');
  });
});
