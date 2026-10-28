import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DecarbonizationSimulatorComponent } from './decarbonization-simulator.component';
import { EmissionsService } from '../emissions.service';
import { of, throwError } from 'rxjs';
import {
  CountryElectricityProfile,
  DecarbonizationScenarioResponse,
} from '../../models/simulator.models';

describe('DecarbonizationSimulatorComponent', () => {
  let component: DecarbonizationSimulatorComponent;
  let fixture: ComponentFixture<DecarbonizationSimulatorComponent>;
  let emissionsServiceSpy: jasmine.SpyObj<EmissionsService>;

  const mockCountries: CountryElectricityProfile[] = [
    {
      countryCode: 'IND',
      countryName: 'India',
      totalGenerationTwh: 1918.26,
      coalGenerationTwh: 1445.44,
      gasGenerationTwh: 50.8,
      oilGenerationTwh: 3.85,
      totalFossilGenerationTwh: 1500.09,
      cleanGenerationTwh: 418.17,
      cleanPowerSharePct: 21.8,
      powerSectorEmissionsMt: 1369.09,
      gridCarbonIntensityGco2PerKwh: 713.72,
      dataSource: 'Ember Climate - Yearly Electricity Data (GER 2024 / 2023 Consolidated Annual Baseline)',
      baselineYear: 2023,
    },
    {
      countryCode: 'GBR',
      countryName: 'United Kingdom',
      totalGenerationTwh: 292.53,
      coalGenerationTwh: 3.78,
      gasGenerationTwh: 101.66,
      oilGenerationTwh: 10.82,
      totalFossilGenerationTwh: 116.26,
      cleanGenerationTwh: 176.27,
      cleanPowerSharePct: 60.25,
      powerSectorEmissionsMt: 68.92,
      gridCarbonIntensityGco2PerKwh: 235.6,
      dataSource: 'Ember Climate - Yearly Electricity Data (GER 2024 / 2023 Consolidated Annual Baseline)',
      baselineYear: 2023,
    },
  ];

  const mockResponse: DecarbonizationScenarioResponse = {
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
      sourceName: 'Ember Climate - Yearly Electricity Data (GER 2024 / 2023 Consolidated Annual Baseline)',
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
      avoidedDirectEmissionsMt: 47.5,
      simulatedDirectPowerEmissionsMt: null,
      simulatedDirectGridIntensityGco2PerKwh: null,
      grossDisplacedLifecycleMt: 41.0,
      cleanEmbodiedLifecycleMt: 2.4,
      netAvoidedLifecycleMt: 38.6,
      netAvoidedEmissionsMt: 38.6,
      netAvoidedEmissionsTonnes: 38600000.0,
      grossAvoidedEmissionsMt: 41.0,
      cleanReplacementLifecycleEmissionsMt: 2.4,
      powerSectorEmissionsReductionPct: null,
      nationalEmissionsReductionPct: null,
      gridIntensityDeltaGco2PerKwh: null,
      cleanShareDeltaPct: 2.61,
      netNegativeAbatement: false,
      simulatedMetricsUnavailableReason: 'Post-scenario national inventory metrics are DISABLED and UNAVAILABLE.',
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
      displacedEmissionFactorGco2PerKwh: 820.0,
      displacedFactorSource: 'IPCC AR5 WGIII Table A.III.2',
      displacedFactorPublicationYear: 2014,
      displacedFactorBoundary: 'LIFECYCLE_SCOPE_1_2_3',
      replacementSource: 'SOLAR_PV',
      replacementGenerationTwh: 50.0,
      replacementGenerationGwh: 50000.0,
      replacementEmissionFactorGco2PerKwh: 48.0,
      replacementFactorSource: 'IPCC AR5 WGIII Table A.III.2',
      replacementFactorPublicationYear: 2014,
      replacementFactorBoundary: 'LIFECYCLE_SCOPE_1_2_3',
      gwpConvention: 'IPCC AR6 100-year GWP',
      geographicAccountingScope: 'Transnational cradle-to-grave lifecycle boundary',
      dispatchEquivalenceCaveat: 'Assumes static 1:1 displacement',
      documentedExclusions: [
        'Energy Storage Excluded',
        'Diurnal & Seasonal Timing Excluded',
        'Thermal Ramping & Minimum Plant Loading Excluded',
        'Grid Transmission Losses & Bottlenecks Excluded',
        'Renewable Curtailment Excluded',
        'Demand Load Growth Excluded'
      ],
      customDisplacedFactor: false,
      customReplacementFactor: false,
    },
    calculationMethod: 'Deterministic Marginal Electricity Displacement with Full Life-Cycle Accounting',
    formula: 'Net Avoided (Mt) = [Displaced Generation (GWh) × (EF_displaced - EF_clean)] / 1,000,000',
    accountingStandard: 'IPCC AR5 WGIII Table A.III.2 & GHG Protocol Scope 2 Guidelines',
    limitations: ['Assumes direct 1:1 energy displacement.'],
    provenance: {
      status: 'DETERMINISTIC_MODEL_RESULT',
      sourceName: 'Ember Climate & IPCC AR5 WGIII Table A.III.2',
      empirical: false,
      reportingYear: 2023,
    },
    timestamp: '2026-10-27T16:00:00Z',
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('EmissionsService', [
      'getSimulatorCountries',
      'calculateDecarbonizationScenario',
      'setActiveScenario',
    ]);

    await TestBed.configureTestingModule({
      imports: [DecarbonizationSimulatorComponent],
      providers: [{ provide: EmissionsService, useValue: spy }],
    }).compileComponents();

    emissionsServiceSpy = TestBed.inject(EmissionsService) as jasmine.SpyObj<EmissionsService>;
    emissionsServiceSpy.getSimulatorCountries.and.returnValue(of(mockCountries));
    emissionsServiceSpy.calculateDecarbonizationScenario.and.returnValue(of(mockResponse));

    fixture = TestBed.createComponent(DecarbonizationSimulatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load supported countries on init', () => {
    expect(component).toBeTruthy();
    expect(component.countries.length).toBe(2);
    expect(component.selectedCountry?.countryCode).toBe('IND');
  });

  it('should detect when requested generation exceeds max available fossil generation', () => {
    component.selectCountry('GBR');
    component.displacedFuel = 'COAL'; // GBR only has 3.78 TWh coal
    component.generationAmount = 10.0;
    component.generationUnit = 'TWH';

    expect(component.isExceedingAvailable).toBeTrue();
    expect(component.maxAvailableDisplacedTwh).toBe(3.78);
  });

  it('should render calculation results with net avoided emissions and unavailable post-scenario inventory badge', () => {
    component.selectCountry('IND');
    component.displacedFuel = 'COAL';
    component.replacementCleanSource = 'SOLAR_PV';
    component.generationAmount = 50.0;
    component.runSimulation();
    fixture.detectChanges();

    expect(component.result).toBeTruthy();
    expect(component.result?.impact.netAvoidedEmissionsMt).toBe(38.6);
    expect(component.result?.scenario.simulatedGridCarbonIntensityGco2PerKwh).toBeNull();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('38.60');
    expect(compiled.textContent).toContain('Mt CO₂e / yr');
    expect(compiled.textContent).toContain('Unavailable');
    expect(compiled.textContent).not.toContain('NaN');
    expect(compiled.textContent).toContain('Deterministic Simulation Result');
  });

  it('should require citation source when custom factor override is set', () => {
    component.showAdvancedFactors = true;
    component.customDisplacedFactor = 880;
    component.customDisplacedFactorSource = ''; // missing citation
    component.runSimulation();

    expect(component.errorMessage).toContain('A documented citation source is required');
  });

  it('should display negative net abatement warning when detected', () => {
    const negativeResponse: DecarbonizationScenarioResponse = {
      ...mockResponse,
      impact: {
        ...mockResponse.impact,
        netNegativeAbatement: true,
        netAbatementWarning: 'Replacement clean technology factor exceeds displaced fuel factor.',
      },
    };
    emissionsServiceSpy.calculateDecarbonizationScenario.and.returnValue(of(negativeResponse));

    component.runSimulation();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Warning: Negative Net Abatement Detected');
  });

  it('should display error message when calculation fails or is rejected', () => {
    emissionsServiceSpy.calculateDecarbonizationScenario.and.returnValue(
      throwError(() => ({
        error: { message: 'Physically impossible intervention: exceeds maximum available generation.' },
      }))
    );

    component.generationAmount = 50.0;
    component.runSimulation();
    fixture.detectChanges();

    expect(component.errorMessage).toContain('Physically impossible intervention');
  });

  it('should apply quick presets correctly', () => {
    component.selectCountry('IND');
    component.applyPreset(25, 'WIND_ONSHORE');

    expect(component.generationAmount).toBe(25);
    expect(component.replacementCleanSource).toBe('WIND_ONSHORE');
    expect(component.generationUnit).toBe('TWH');
  });

  it('should display deterministic sensitivity interval bounds and factor ranges', () => {
    component.selectCountry('IND');
    component.runSimulation();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Deterministic Emission Sensitivity Range');
    expect(compiled.textContent).toContain('Lower Bound (Conservative)');
    expect(compiled.textContent).toContain('28.00');
    expect(compiled.textContent).toContain('Central Benchmark (Median)');
    expect(compiled.textContent).toContain('38.60');
    expect(compiled.textContent).toContain('Upper Bound (Optimistic)');
    expect(compiled.textContent).toContain('44.60');
    expect(compiled.textContent).toContain('IPCC AR5');
  });

  it('should add and remove interventions in multi-intervention mode', () => {
    expect(component.interventions.length).toBe(1);

    component.addIntervention();
    expect(component.interventions.length).toBe(2);
    expect(component.interventions[1].generationAmount).toBe(20.0);

    component.addIntervention();
    expect(component.interventions.length).toBe(3);

    component.removeIntervention(1);
    expect(component.interventions.length).toBe(2);

    // Cannot remove below 1
    component.removeIntervention(0);
    component.removeIntervention(0);
    expect(component.interventions.length).toBe(1);
  });

  it('should send multi-intervention payload with dispatch constraints', () => {
    component.selectCountry('IND');
    component.addIntervention(); // now 2 interventions
    component.minResidualCoalTwh = 500.0;
    component.maxCleanAdditionLimitTwh = 100.0;

    component.runSimulation();

    expect(emissionsServiceSpy.calculateDecarbonizationScenario).toHaveBeenCalled();
    const lastCallReq = emissionsServiceSpy.calculateDecarbonizationScenario.calls.mostRecent().args[0];

    expect(lastCallReq.interventions).toBeDefined();
    expect(lastCallReq.interventions?.length).toBe(2);
    expect(lastCallReq.constraints).toBeDefined();
    expect(lastCallReq.constraints?.minResidualCoalTwh).toBe(500.0);
    expect(lastCallReq.constraints?.maxCleanAdditionLimitTwh).toBe(100.0);
  });

  it('should render itemized interventions table and constraint enforcement notes in results', () => {
    const compositeResponse: DecarbonizationScenarioResponse = {
      ...mockResponse,
      scenario: {
        ...mockResponse.scenario,
        totalRequestedCleanGenerationTwh: 70.0,
        totalDisplacedFossilGenerationTwh: 50.0,
        totalUnusedCleanGenerationTwh: 20.0,
        constraintsApplied: true,
        constraintEnforcementSummary: 'Displacement capped due to minimum residual fossil generation constraint.',
      },
      impact: {
        ...mockResponse.impact,
        totalDisplacedFossilGenerationTwh: 50.0,
        totalUnusedCleanGenerationTwh: 20.0,
        constraintsApplied: true,
        dispatchConstraintSummary: 'Displacement capped due to minimum residual fossil generation constraint.',
        itemizedInterventions: [
          {
            interventionIndex: 1,
            interventionId: 'intervention-1',
            cleanSource: 'SOLAR_PV',
            cleanSourceDisplayName: 'Solar PV',
            targetDisplacedFuel: 'COAL',
            targetFuelDisplayName: 'Coal',
            requestedCleanGenerationTwh: 40.0,
            displacedFossilGenerationTwh: 40.0,
            unusedCleanGenerationTwh: 0.0,
            grossAvoidedMt: 32.8,
            cleanReplacementLifecycleMt: 1.92,
            netAvoidedMt: 30.88,
            sensitivityMinMt: 22.4,
            sensitivityMedianMt: 30.88,
            sensitivityMaxMt: 35.6,
            isCapped: false,
            constraintNote: 'Fully dispatched (100% substitution efficiency).',
          },
          {
            interventionIndex: 2,
            interventionId: 'intervention-2',
            cleanSource: 'WIND_ONSHORE',
            cleanSourceDisplayName: 'Onshore Wind',
            targetDisplacedFuel: 'COAL',
            targetFuelDisplayName: 'Coal',
            requestedCleanGenerationTwh: 30.0,
            displacedFossilGenerationTwh: 10.0,
            unusedCleanGenerationTwh: 20.0,
            grossAvoidedMt: 8.2,
            cleanReplacementLifecycleMt: 0.33,
            netAvoidedMt: 7.87,
            sensitivityMinMt: 5.4,
            sensitivityMedianMt: 7.87,
            sensitivityMaxMt: 9.1,
            isCapped: true,
            constraintNote: 'Displacement capped at 10.00 TWh to maintain minimum residual fossil generation constraints.',
          },
        ],
      },
    };

    emissionsServiceSpy.calculateDecarbonizationScenario.and.returnValue(of(compositeResponse));

    component.runSimulation();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Dispatch Constraints Applied');
    expect(compiled.textContent).toContain('Displacement capped due to minimum residual fossil');
    expect(compiled.textContent).toContain('Composite Generation Balance & Dispatch Accounting');
    expect(compiled.textContent).toContain('Itemized Interventions Breakdown');
    expect(compiled.textContent).toContain('Solar PV');
    expect(compiled.textContent).toContain('Onshore Wind');
    expect(compiled.textContent).toContain('Capped');
  });

  it('should render provisional factor warning when unverified oil lifecycle factor is used', () => {
    const provisionalResponse: DecarbonizationScenarioResponse = {
      ...mockResponse,
      provenance: {
        ...mockResponse.provenance,
        isPartialOrProvisional: true,
        unverifiedFactorWarning: '[PROVISIONAL / UNVERIFIED IN TABLE A.III.2] Dedicated oil-fired power lifecycle factor is provisional (500–800 gCO2e/kWh).',
      },
    };

    emissionsServiceSpy.calculateDecarbonizationScenario.and.returnValue(of(provisionalResponse));

    component.runSimulation();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Provisional Emission Factor Warning');
    expect(compiled.textContent).toContain('Dedicated oil-fired power lifecycle factor is provisional');
  });

  it('should calculate car equivalencies and display plain-language impact sentence', () => {
    emissionsServiceSpy.calculateDecarbonizationScenario.and.returnValue(of(mockResponse));
    component.runSimulation();
    fixture.detectChanges();

    // 38.6 Mt / 4.6 tonnes per car/yr = ~8,391,304 cars
    expect(component.passengerVehiclesEquivalent).toBeGreaterThan(8_000_000);
    expect(component.displacedFuelLabel).toBe('Coal');
    expect(component.replacementCleanLabel).toBe('Solar PV (Utility-scale)');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('gasoline cars');
    expect(compiled.textContent).toContain('Energy Transition Simulator');
    expect(compiled.textContent).not.toContain('Phase 3');
    expect(compiled.textContent).not.toContain('Phase 4');
  });

  it('should toggle TWh contextual explainer and advanced options disclosure', () => {
    expect(component.showTwhExplainer).toBeFalse();
    component.showTwhExplainer = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('1 Terawatt-hour (TWh) = 1,000 Gigawatt-hours');

    expect(component.showAdvancedOptions).toBeFalse();
    component.showAdvancedOptions = true;
    fixture.detectChanges();
    expect(compiled.textContent).toContain('Accounting Boundary Standard');
  });
});
