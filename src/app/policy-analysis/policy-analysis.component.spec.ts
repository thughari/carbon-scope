import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolicyAnalysisComponent } from './policy-analysis.component';
import { EmissionsService } from '../emissions.service';
import { of } from 'rxjs';
import { CountryNdcProfile, InterventionEvidence, PolicyComparisonResponse, ScenarioNdcComparison } from '../../models/policy.models';
import { DecarbonizationScenarioResponse } from '../../models/simulator.models';

describe('PolicyAnalysisComponent', () => {
  let component: PolicyAnalysisComponent;
  let fixture: ComponentFixture<PolicyAnalysisComponent>;
  let emissionsServiceSpy: jasmine.SpyObj<EmissionsService>;

  const mockInterventions: InterventionEvidence[] = [
    {
      technologyId: 'SOLAR_PV',
      displayName: 'Utility-Scale Solar PV',
      category: 'CLEAN_GENERATION',
      directFactorGco2PerKwh: 0,
      lifecycleFactorMedianGco2PerKwh: 48,
      lifecycleFactorMinGco2PerKwh: 18,
      lifecycleFactorMaxGco2PerKwh: 180,
      emissionFactorUnit: 'gCO2e/kWh',
      sourceCitation: 'IPCC AR5 WGIII Table A.III.2',
      publicationYear: 2014,
      accountingBoundary: 'CRADLE_TO_GRAVE_SCOPE_1_2_3',
      technologyScope: 'Crystalline silicon ground-mounted utility arrays',
      geographicApplicability: 'Global harmonized literature',
      dataQualityRating: 'Gold Standard',
      isProvisional: false,
      physicalLimitations: ['Diurnal Intermittency'],
      lcoeDataAvailable: false,
      lcoeUnavailableReason: 'Empirical LCOE varies by regional tenders; not harmonized in Table A.III.2.',
      capacityFactorDataAvailable: false,
      capacityFactorUnavailableReason: 'Empirical capacity factors depend on local irradiance.'
    },
    {
      technologyId: 'OIL_PEAKER',
      displayName: 'Oil/Diesel Peaking Generation',
      category: 'FOSSIL_DISPLACEMENT',
      directFactorGco2PerKwh: 720,
      lifecycleFactorMedianGco2PerKwh: 750,
      lifecycleFactorMinGco2PerKwh: 500,
      lifecycleFactorMaxGco2PerKwh: 800,
      emissionFactorUnit: 'gCO2e/kWh',
      sourceCitation: 'IPCC AR5 WGIII Chapter 7',
      publicationYear: 2014,
      accountingBoundary: 'CRADLE_TO_GRAVE_SCOPE_1_2_3',
      technologyScope: 'Open-cycle diesel and heavy fuel oil combustion turbines',
      geographicApplicability: 'Global peaking literature',
      dataQualityRating: 'Provisional Expert Derivation',
      isProvisional: true,
      provisionalWarning: 'PROVISIONAL / UNVERIFIED IN TABLE A.III.2: Dedicated oil factor is provisional.',
      physicalLimitations: ['High Fuel Cost & Price Volatility'],
      lcoeDataAvailable: false,
      capacityFactorDataAvailable: false
    }
  ];

  const mockIndiaNdc: CountryNdcProfile = {
    countryCode: 'IND',
    countryName: 'India',
    documentTitle: "India's Nationally Determined Contribution 3.0 (2031–2035)",
    submissionDate: '2022-08-26',
    latestSubmissionDate: '2026-04-24',
    activeNdcCycle: 'NDC 3.0 (2035 Horizon)',
    previousSubmissionsSummary: 'First NDC (2015/2016), Updated First NDC (2022)',
    unfcccRegistryUrl: 'https://unfccc.int/NDCREG',
    documentLanguage: 'English',
    longTermGoal: 'Net-zero greenhouse gas emissions by 2070.',
    targetYearPrimary: 2035,
    policyReviewStatus: 'VERIFIED_ACTIVE',
    treatyParticipationStatus: 'PARTY_ACTIVE',
    verificationDate: '2026-10-28',
    targets: [
      {
        id: 'IND-T1',
        targetTitle: 'Emissions Intensity of GDP Reduction (2035 NDC 3.0)',
        targetType: 'INTENSITY_GDP',
        targetClassification: 'OFFICIAL_NDC_COMMITMENT',
        targetCurrencyStatus: 'ACTIVE_LATEST_COMMITMENT',
        targetYear: 2035,
        baselineYear: 2005,
        commitmentStatus: 'UNCONDITIONAL',
        targetValue: 47,
        targetUnit: 'PERCENT',
        sectorScope: 'ECONOMY_WIDE',
        officialDescription: 'Reduce emissions intensity of GDP by 47 percent by 2035 from 2005 levels.',
        legalBasisCitation: 'Official NDC 3.0 Submission to UNFCCC (April 2026)',
        verificationDate: '2026-10-28',
        interpretationCaveats: ['Economy-wide target indexed to real GDP. Cannot be calculated as power-sector percentage.']
      },
      {
        id: 'IND-T2',
        targetTitle: 'Non-Fossil Installed Electric Capacity Share (2035 NDC 3.0)',
        targetType: 'RENEWABLE_SHARE_CAPACITY',
        targetClassification: 'OFFICIAL_NDC_COMMITMENT',
        targetCurrencyStatus: 'ACTIVE_LATEST_COMMITMENT',
        targetYear: 2035,
        baselineYear: null,
        commitmentStatus: 'CONDITIONAL',
        targetValue: 60,
        targetUnit: 'PERCENT',
        sectorScope: 'POWER_SECTOR',
        officialDescription: 'Achieve 60 percent cumulative electric power installed capacity from non-fossil resources by 2035.',
        legalBasisCitation: 'Official NDC 3.0 Submission to UNFCCC (April 2026)',
        powerSectorImplication: 'Applies to installed nameplate MW capacity (not generated TWh).',
        interpretationCaveats: ['Capacity (GW) does not equate to generation (TWh) due to lower capacity factors of RE.']
      },
      {
        id: 'IND-T3',
        targetTitle: 'Non-Fossil Installed Electric Capacity Share (2030 Milestone)',
        targetType: 'RENEWABLE_SHARE_CAPACITY',
        targetClassification: 'OFFICIAL_NDC_COMMITMENT',
        targetCurrencyStatus: 'HISTORICAL_INTERMEDIATE_TARGET',
        targetYear: 2030,
        baselineYear: null,
        commitmentStatus: 'CONDITIONAL',
        targetValue: 50,
        targetUnit: 'PERCENT',
        sectorScope: 'POWER_SECTOR',
        officialDescription: 'Achieve 50 percent non-fossil installed capacity by 2030 (achieved early in 2026).',
        legalBasisCitation: 'Updated First NDC (August 2022)',
        interpretationCaveats: ['Historical 2030 milestone from prior submission cycle.']
      }
    ],
    provenance: {
      status: 'STATIC_REFERENCE_BENCHMARK',
      sourceName: 'UNFCCC NDC Interim Registry',
      methodology: 'Official Party NDC Submission',
      reportingYear: 2026,
      temporalCompleteness: 'CONSOLIDATED_ANNUAL',
      isPartialOrProvisional: false,
      empirical: true,
      qualityNotes: 'Official national commitment document.'
    }
  };

  const mockComparison: ScenarioNdcComparison = {
    countryCode: 'IND',
    countryName: 'India',
    scenarioName: 'Displace 50.0 TWh Coal with Solar PV in India',
    requestedCleanTwh: 50.0,
    displacedFossilTwh: 50.0,
    avoidedDirectMt: 47.50,
    netAvoidedLifecycleMt: 47.60,
    baselineCleanSharePct: 23.5,
    simulatedCleanSharePct: 26.1,
    cleanShareDeltaPct: 2.6,
    hasPowerSectorTarget: true,
    comparedTargetTitle: 'Non-Fossil Installed Electric Capacity Share (2035 NDC 3.0)',
    comparedTargetClassification: 'OFFICIAL_NDC_COMMITMENT',
    comparedTargetCurrencyStatus: 'ACTIVE_LATEST_COMMITMENT',
    targetPowerCapacitySharePct: 60.0,
    targetPowerCleanGenerationSharePct: null,
    targetPowerCleanSharePct: null,
    cleanShareDistanceToTargetPct: null,
    comparabilityStatus: 'NON_COMPARABLE_CAPACITY_VS_GENERATION',
    alignmentStatus: 'METRIC_MISMATCH_CAPACITY_VS_GENERATION',
    alignmentSummary: 'Country target is 60.0% non-fossil INSTALLED CAPACITY (GW) by 2035, whereas this scenario models GENERATION.',
    scopeMismatchExplanation: 'Capacity (nameplate GW) differs substantially from actual electrical generation (TWh).',
    methodologicalCaveats: [
      'Modeled avoided emissions reflect an analytical marginal substitution scenario, NOT an official government forecast.',
      'Net lifecycle abatement cannot be subtracted directly from a national territorial GHG inventory.'
    ]
  };

  const mockOverviewResponse: PolicyComparisonResponse = {
    interventions: mockInterventions,
    countryNdc: mockIndiaNdc,
    scenarioComparison: mockComparison,
    methodologyNote: 'IPCC AR5 Table A.III.2 and UNFCCC registry.',
    timestamp: '2026-10-28T12:00:00Z'
  };

  beforeEach(async () => {
    emissionsServiceSpy = jasmine.createSpyObj('EmissionsService', [
      'getPolicyOverview',
      'getNdcProfiles',
      'getNdcProfile',
      'getInterventions',
      'compareScenarioWithNdc'
    ]);

    emissionsServiceSpy.getPolicyOverview.and.returnValue(of(mockOverviewResponse));
    emissionsServiceSpy.getNdcProfiles.and.returnValue(of([mockIndiaNdc]));

    await TestBed.configureTestingModule({
      imports: [PolicyAnalysisComponent],
      providers: [
        { provide: EmissionsService, useValue: emissionsServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create PolicyAnalysisComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should load interventions and country NDC on initialization', () => {
    expect(emissionsServiceSpy.getPolicyOverview).toHaveBeenCalledWith('IND');
    expect(component.interventions.length).toBe(2);
    expect(component.countryNdc?.countryCode).toBe('IND');
    expect(component.countryNdc?.targets.length).toBe(3);
  });

  it('should assert utility-scale solar factor range against verified Table A.III.2 (18 to 180 gCO2e/kWh)', () => {
    const solar = component.interventions.find(i => i.technologyId === 'SOLAR_PV');
    expect(solar).toBeDefined();
    expect(solar?.lifecycleFactorMinGco2PerKwh).toBe(18);
    expect(solar?.lifecycleFactorMedianGco2PerKwh).toBe(48);
    expect(solar?.lifecycleFactorMaxGco2PerKwh).toBe(180);
    expect(solar?.lifecycleFactorMinGco2PerKwh).not.toBe(26);
    expect(solar?.lifecycleFactorMaxGco2PerKwh).not.toBe(60);
  });

  it('should display unavailable indicators for LCOE and capacity factor without fabricating data', () => {
    const solar = component.interventions.find(i => i.technologyId === 'SOLAR_PV');
    expect(solar).toBeDefined();
    expect(solar?.lcoeDataAvailable).toBeFalse();
    expect(solar?.capacityFactorDataAvailable).toBeFalse();
    expect(solar?.lcoeUnavailableReason).toContain('not harmonized in Table A.III.2');
  });

  it('should flag provisional oil lifecycle factor visibly', () => {
    const oil = component.interventions.find(i => i.technologyId === 'OIL_PEAKER');
    expect(oil).toBeDefined();
    expect(oil?.isProvisional).toBeTrue();
    expect(oil?.provisionalWarning).toContain('PROVISIONAL / UNVERIFIED');
  });

  it('should detect metric mismatch and suppress distance to target for capacity targets', () => {
    expect(component.scenarioComparison?.comparabilityStatus).toBe('NON_COMPARABLE_CAPACITY_VS_GENERATION');
    expect(component.scenarioComparison?.cleanShareDistanceToTargetPct).toBeNull();
    expect(component.scenarioComparison?.targetPowerCapacitySharePct).toBe(60.0);
    expect(component.scenarioComparison?.scopeMismatchExplanation).toContain('Capacity (nameplate GW) differs substantially');
  });

  it('should distinguish target provenance classification and currency labels', () => {
    expect(component.getClassificationLabel('OFFICIAL_NDC_COMMITMENT')).toBe('Official NDC');
    expect(component.getClassificationLabel('JOINT_EU_NDC_COMMITMENT')).toBe('Joint EU NDC');
    expect(component.getClassificationLabel('DOMESTIC_POLICY_LAW')).toBe('National Law / Policy');

    expect(component.getCurrencyLabel('ACTIVE_LATEST_COMMITMENT')).toBe('Active 2035');
    expect(component.getCurrencyLabel('HISTORICAL_INTERMEDIATE_TARGET')).toBe('2030 Milestone');
    expect(component.getCurrencyLabel('HISTORICAL_SUPERSEDED_OR_WITHDRAWN')).toBe('Historical (Withdrawn)');

    expect(component.getAlignmentBadgeClass('WITHDRAWN_TREATY_NON_PARTY')).toBe('bg-rose-500/15 text-rose-300 border-rose-500/30');
    expect(component.getAlignmentIcon('WITHDRAWN_TREATY_NON_PARTY')).toBe('exclamation-triangle');
  });

  it('should render treaty withdrawal notice when country is a withdrawn non-party', () => {
    const mockUsaNdc: CountryNdcProfile = {
      ...mockIndiaNdc,
      countryCode: 'USA',
      countryName: 'United States',
      policyReviewStatus: 'WITHDRAWN_PARIS_AGREEMENT',
      treatyParticipationStatus: 'WITHDRAWN_NON_PARTY',
      treatyWithdrawalEffectiveDate: '2026-01-27'
    };

    component.countryNdc = mockUsaNdc;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Non-Party (Withdrawn Effective 2026-01-27)');
    expect(compiled.textContent).toContain('UNFCCC Treaty Participation Notice: Withdrawal in Effect');
    expect(compiled.textContent).toContain('January 27, 2026');
  });

  it('should filter interventions by category', () => {
    component.filterInterventions('CLEAN_GENERATION');
    expect(component.filteredInterventions.length).toBe(1);
    expect(component.filteredInterventions[0].technologyId).toBe('SOLAR_PV');

    component.filterInterventions('FOSSIL_DISPLACEMENT');
    expect(component.filteredInterventions.length).toBe(1);
    expect(component.filteredInterventions[0].technologyId).toBe('OIL_PEAKER');

    component.filterInterventions('ALL');
    expect(component.filteredInterventions.length).toBe(2);
  });

  it('should reload data when country selection changes', () => {
    emissionsServiceSpy.getPolicyOverview.calls.reset();
    emissionsServiceSpy.getPolicyOverview.and.returnValue(of({
      ...mockOverviewResponse,
      countryNdc: { ...mockIndiaNdc, countryCode: 'USA', countryName: 'United States' }
    }));

    component.onCountrySelect('USA');

    expect(component.selectedCountry).toBe('USA');
    expect(emissionsServiceSpy.getPolicyOverview).toHaveBeenCalledWith('USA');
  });

  it('should emit navigateToSimulator when goToSimulator is called', () => {
    spyOn(component.navigateToSimulator, 'emit');
    component.goToSimulator();
    expect(component.navigateToSimulator.emit).toHaveBeenCalled();
  });
});
