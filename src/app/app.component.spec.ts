import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideMarkdown } from 'ngx-markdown';
import { AppComponent } from './app.component';
import { EmissionsService } from './emissions.service';
import { SystemStatusService } from './system-status.service';

describe('AppComponent', () => {
  const mockEmissionsService = {
    getOverview: () => of({
      country: 'IND',
      countryName: 'India',
      continent: 'Asia',
      year: 2024,
      gas: 'co2e_100yr',
      totalEmissionsTonnes: 4165367372,
      totalEmissionsMt: 4165.4,
      worldEmissionsMt: 57582,
      countryRank: 3,
      percentageOfGlobal: 7.23,
      perCapitaTonnes: 2.0,
      gridCarbonIntensityGco2PerKwh: 680,
      cleanPowerPercentage: 23.5,
      gasBreakdownMt: {},
      sectorTotalsMt: {},
      historicalTrend: [],
      verifiedSources: [],
      dataReliability: 'Empirical Satellite Inventory (Climate TRACE v6)',
      dataSourceStatus: 'LIVE_API_OBSERVATION',
      responseTimeMs: 5
    }),
    getSourcesInfo: () => of({ sources: [], lastSynchronized: '', globalConsensusFramework: '' }),
    getSectorSummary: () => of({ sectorTotals: {}, gas: 'co2e_100yr', year: 2024 }),
    getSubsectorSummary: () => of({ sector: 'power', subsectorTotals: {}, gas: 'co2e_100yr', year: 2024 }),
    getSimulatorCountries: () => of([]),
    calculateDecarbonizationScenario: () => of({}),
    activeScenario$: of(null),
    setActiveScenario: () => {},
    getPolicyOverview: () => of({
      interventions: [],
      countryNdc: {
        countryCode: 'IND',
        countryName: 'India',
        documentTitle: 'Updated First NDC',
        submissionDate: '2022-08-26',
        unfcccRegistryUrl: 'https://unfccc.int/NDCREG',
        documentLanguage: 'English',
        longTermGoal: 'Net-zero by 2070',
        targetYearPrimary: 2030,
        targets: [],
        provenance: {
          status: 'STATIC_REFERENCE_BENCHMARK',
          sourceName: 'UNFCCC',
          methodology: 'NDC',
          reportingYear: 2022,
          temporalCompleteness: 'CONSOLIDATED_ANNUAL',
          isPartialOrProvisional: false,
          empirical: true,
          qualityNotes: ''
        }
      },
      scenarioComparison: null,
      methodologyNote: '',
      timestamp: ''
    }),
    getNdcProfiles: () => of([]),
    compareScenarioWithNdc: () => of({})
  };

  const mockSystemStatusService = {
    isOnline$: of(true),
    health$: of({ status: 'UP' })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideMarkdown(),
        { provide: EmissionsService, useValue: mockEmissionsService },
        { provide: SystemStatusService, useValue: mockSystemStatusService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'CarbonScope' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('CarbonScope');
  });

  it('should render title in DOM', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('CarbonScope');
  });

  it('should switch between dashboard, simulator, and policy tabs', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.activeTab).toBe('dashboard');

    app.setActiveTab('simulator');
    expect(app.activeTab).toBe('simulator');

    app.setActiveTab('policy');
    expect(app.activeTab).toBe('policy');

    app.setActiveTab('dashboard');
    expect(app.activeTab).toBe('dashboard');
  });

  it('should render welcoming FTUX hero with 3 primary action cards on Overview', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Track Global Greenhouse Gas Emissions & Test Real Clean Energy Solutions');
    expect(compiled.textContent).toContain('Explore Emissions');
    expect(compiled.textContent).toContain('Simulate a Cleaner Future');
    expect(compiled.textContent).toContain('Understand Climate Targets');
    expect(compiled.textContent).not.toContain('Phase 4');
    expect(compiled.textContent).not.toContain('Phase 3');
  });

  it('should toggle FTUX guide visibility when toggleWelcome is called', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.welcomeDismissed).toBeFalse();

    app.toggleWelcome();
    expect(app.welcomeDismissed).toBeTrue();

    app.toggleWelcome();
    expect(app.welcomeDismissed).toBeFalse();
  });

  it('should display plain-language navigation tab labels', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Overview');
    expect(compiled.textContent).toContain('Energy Simulator');
    expect(compiled.textContent).toContain('Climate Targets');
    expect(compiled.textContent).toContain('Data & Sources');
  });
});
