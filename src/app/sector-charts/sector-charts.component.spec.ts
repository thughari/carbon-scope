import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectorChartsComponent } from './sector-charts.component';
import { EmissionsService } from '../emissions.service';
import { of, BehaviorSubject } from 'rxjs';
import { DecarbonizationScenarioResponse } from '../../models/simulator.models';

describe('SectorChartsComponent', () => {
  let component: SectorChartsComponent;
  let fixture: ComponentFixture<SectorChartsComponent>;
  let activeScenarioSubject: BehaviorSubject<DecarbonizationScenarioResponse | null>;
  let emissionsServiceMock: Partial<EmissionsService>;

  const mockScenario: DecarbonizationScenarioResponse = {
    countryCode: 'IND',
    countryName: 'India',
    interventionName: 'Displace 50.0 TWh Coal with Solar PV in India',
    accountingBoundary: 'LIFECYCLE_SCOPE_1_2_3',
    boundaryDescription: 'Evaluates global cradle-to-grave lifecycle abatement (Scope 1+2+3).',
    baseline: {
      totalGenerationTwh: 1918.26,
      fossilGenerationTwh: 1500.09,
      targetFuelGenerationTwh: 1445.44,
      cleanGenerationTwh: 418.17,
      cleanPowerSharePct: 21.8,
      powerSectorEmissionsMt: 1369.09,
      gridCarbonIntensityGco2PerKwh: 713.72,
      nationalTotalEmissionsMt: 4165.4,
      sourceName: 'Ember 2024',
      reportingYear: 2023,
    },
    scenario: {
      totalGenerationTwh: 1918.26,
      simulatedFossilGenerationTwh: 1450.09,
      simulatedTargetFuelGenerationTwh: 1395.44,
      simulatedCleanGenerationTwh: 468.17,
      simulatedCleanPowerSharePct: 24.41,
      simulatedPowerSectorEmissionsMt: null,
      simulatedGridCarbonIntensityGco2PerKwh: null,
      simulatedNationalTotalEmissionsMt: null,
    },
    impact: {
      grossAvoidedEmissionsMt: 41.0,
      cleanReplacementLifecycleEmissionsMt: 2.4,
      netAvoidedEmissionsMt: 38.6,
      netAvoidedEmissionsTonnes: 38600000.0,
      powerSectorEmissionsReductionPct: null,
      nationalEmissionsReductionPct: null,
      gridIntensityDeltaGco2PerKwh: null,
      cleanShareDeltaPct: 2.61,
      avoidedDirectEmissionsMt: 47.5,
      simulatedDirectPowerEmissionsMt: null,
      simulatedDirectGridIntensityGco2PerKwh: null,
      grossDisplacedLifecycleMt: 41.0,
      cleanEmbodiedLifecycleMt: 2.4,
      netAvoidedLifecycleMt: 38.6,
      netNegativeAbatement: false,
      sensitivityInterval: {
        minAvoidedEmissionsMt: 28.0,
        medianAvoidedEmissionsMt: 38.6,
        maxAvoidedEmissionsMt: 44.6,
        displacedFactorMinGco2PerKwh: 740,
        displacedFactorMedianGco2PerKwh: 820,
        displacedFactorMaxGco2PerKwh: 910,
        replacementFactorMinGco2PerKwh: 18,
        replacementFactorMedianGco2PerKwh: 48,
        replacementFactorMaxGco2PerKwh: 180,
        emissionFactorUnit: 'gCO2e/kWh',
        emissionsUnit: 'Mt CO2e/yr',
        uncertaintyDescription: 'IPCC AR5 WGIII Annex III literature harmonized factors',
        sourceCitation: 'IPCC AR5 WGIII Table A.III.2',
        publicationYear: 2014,
        accountingBoundary: 'LIFECYCLE_SCOPE_1_2_3',
      },
    },
    assumptions: {
      displacedFuel: 'COAL',
      displacedGenerationTwh: 50.0,
      displacedGenerationGwh: 50000.0,
      displacedEmissionFactorGco2PerKwh: 1000.0,
      displacedFactorSource: 'IPCC AR6 WGIII Table A.III.2',
      displacedFactorPublicationYear: 2022,
      replacementSource: 'SOLAR_PV',
      replacementGenerationTwh: 50.0,
      replacementGenerationGwh: 50000.0,
      replacementEmissionFactorGco2PerKwh: 48.0,
      replacementFactorSource: 'IPCC AR6 WGIII Table A.III.2',
      replacementFactorPublicationYear: 2022,
      customDisplacedFactor: false,
      customReplacementFactor: false,
    },
    calculationMethod: 'IPCC AR6 WGIII Life-Cycle Assessment',
    formula: 'Net Life-Cycle Avoided (Mt CO₂e) = [Displaced Generation (GWh) × (EF_displaced - EF_clean)] / 1,000,000',
    accountingStandard: 'IPCC AR6 WGIII Annex III & ISO 14040/44',
    limitations: ['Post-scenario national inventory metrics disabled'],
    provenance: {
      status: 'DETERMINISTIC_MODEL_RESULT',
      empirical: false,
    },
    timestamp: new Date().toISOString(),
  };

  beforeEach(async () => {
    activeScenarioSubject = new BehaviorSubject<DecarbonizationScenarioResponse | null>(null);
    emissionsServiceMock = {
      activeScenario$: activeScenarioSubject.asObservable(),
      getActiveScenario: () => activeScenarioSubject.getValue(),
    };

    await TestBed.configureTestingModule({
      imports: [SectorChartsComponent],
      providers: [
        { provide: EmissionsService, useValue: emissionsServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SectorChartsComponent);
    component = fixture.componentInstance;
    component.historicalTrend = [
      { year: 2021, emissionsMt: 3200, worldEmissionsMt: 50000, shareOfGlobal: 6.4, provenance: 'LIVE_API_OBSERVATION' },
      { year: 2022, emissionsMt: 3350, worldEmissionsMt: 51000, shareOfGlobal: 6.5, provenance: 'LIVE_API_OBSERVATION' },
      { year: 2023, emissionsMt: 3450, worldEmissionsMt: 52000, shareOfGlobal: 6.6, provenance: 'LIVE_API_OBSERVATION' },
    ];
    fixture.detectChanges();
  });

  it('should create component successfully', () => {
    expect(component).toBeTruthy();
  });

  it('should render empirical trend text correctly when no scenario is active', () => {
    expect(component.trendRangeText).toBe('2021 - 2023 (Satellite Observations)');
    expect(component.currentScenario).toBeNull();
  });

  it('should integrate scenarioResult with sensitivity interval when provided as Input', () => {
    component.scenarioResult = mockScenario;
    fixture.detectChanges();

    expect(component.currentScenario).toBeTruthy();
    expect(component.scenarioMedianText).toContain('-38.6 Mt CO2e/yr');
    expect(component.scenarioRangeText).toContain('-28.0 to -44.6 Mt CO2e/yr');
  });

  it('should react to activeScenario$ stream from EmissionsService', () => {
    activeScenarioSubject.next(mockScenario);
    fixture.detectChanges();

    expect(component.currentScenario).toBeTruthy();
    expect(component.scenarioMedianText).toContain('-38.6 Mt CO2e/yr');
  });

  it('should toggle scenario overlay visibility safely', () => {
    component.scenarioResult = mockScenario;
    expect(component.showScenarioOverlay).toBeTrue();

    component.toggleScenarioOverlay();
    expect(component.showScenarioOverlay).toBeFalse();

    component.toggleScenarioOverlay();
    expect(component.showScenarioOverlay).toBeTrue();
  });

  it('should handle null or empty historical trend without throwing errors', () => {
    component.historicalTrend = [];
    component.trendYears = [];
    component.scenarioResult = null;
    expect(() => component.ngOnChanges({})).not.toThrow();
  });
});
