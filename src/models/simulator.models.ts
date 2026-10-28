import { ProvenanceDto } from './emissions.models';

export interface CountryElectricityProfile {
  countryCode: string;
  countryName: string;
  totalGenerationTwh: number;
  coalGenerationTwh: number;
  gasGenerationTwh: number;
  oilGenerationTwh: number;
  totalFossilGenerationTwh: number;
  cleanGenerationTwh: number;
  cleanPowerSharePct: number;
  powerSectorEmissionsMt: number;
  gridCarbonIntensityGco2PerKwh: number;
  dataSource: string;
  datasetUrl?: string;
  publisher?: string;
  baselineYear: number;
  accountingBoundary?: string;
  metricDefinition?: string;
  generationAccountingConvention?: string;
  reconciliationStatus?: string;
  datasetSnapshotDate?: string;
  methodologyUrl?: string;
  sourcePublishedMetrics?: string;
  derivedMetrics?: string;
}

export interface ScenarioIntervention {
  id?: string;
  cleanSource: 'SOLAR_PV' | 'WIND_ONSHORE' | 'WIND_OFFSHORE' | 'NUCLEAR' | 'HYDRO' | string;
  generationAmount: number;
  generationUnit: 'TWH' | 'GWH' | string;
  targetDisplacedFuel: 'COAL' | 'FOSSIL_GAS' | 'OIL' | 'GRID_FOSSIL_MIX' | string;
  customDisplacedEmissionFactor?: number | null;
  customDisplacedFactorSource?: string | null;
  customReplacementEmissionFactor?: number | null;
  customReplacementFactorSource?: string | null;
}

export interface ScenarioConstraints {
  minResidualCoalTwh?: number | null;
  minResidualGasTwh?: number | null;
  minResidualOilTwh?: number | null;
  minResidualFossilTwh?: number | null;
  maxCleanAdditionLimitTwh?: number | null;
}

export interface InterventionResult {
  interventionIndex: number;
  interventionId: string;
  cleanSource: string;
  cleanSourceDisplayName: string;
  targetDisplacedFuel: string;
  targetFuelDisplayName: string;
  requestedCleanGenerationTwh: number;
  displacedFossilGenerationTwh: number;
  unusedCleanGenerationTwh: number;
  grossAvoidedMt: number;
  cleanReplacementLifecycleMt: number;
  netAvoidedMt: number;
  sensitivityMinMt: number;
  sensitivityMedianMt: number;
  sensitivityMaxMt: number;
  isCapped: boolean;
  constraintNote: string;
}

export interface DecarbonizationScenarioRequest {
  countryCode: string;
  displacedFuel?: 'COAL' | 'FOSSIL_GAS' | 'OIL' | 'GRID_FOSSIL_MIX' | string;
  replacementCleanSource?: 'SOLAR_PV' | 'WIND_ONSHORE' | 'WIND_OFFSHORE' | 'NUCLEAR' | 'HYDRO' | string;
  generationAmount?: number;
  generationUnit?: 'TWH' | 'GWH' | string;
  accountingBoundary?: 'OPERATIONAL_SCOPE_1' | 'LIFECYCLE_SCOPE_1_2_3' | string;
  customDisplacedEmissionFactor?: number | null;
  customDisplacedFactorSource?: string | null;
  customReplacementEmissionFactor?: number | null;
  customReplacementFactorSource?: string | null;
  interventions?: ScenarioIntervention[];
  constraints?: ScenarioConstraints | null;
}

export interface DecarbonizationBaseline {
  totalGenerationTwh: number;
  fossilGenerationTwh: number;
  targetFuelGenerationTwh: number;
  cleanGenerationTwh: number;
  cleanPowerSharePct: number;
  powerSectorEmissionsMt: number;
  gridCarbonIntensityGco2PerKwh: number;
  nationalTotalEmissionsMt: number;
  sourceName: string;
  datasetUrl?: string;
  reportingYear: number;
  accountingBoundary?: string;
  metricDefinition?: string;
  generationAccountingConvention?: string;
  reconciliationStatus?: string;
  cleanTechnologiesIncluded?: string;
  datasetSnapshotDate?: string;
  methodologyUrl?: string;
  sourcePublishedMetrics?: string;
  derivedMetrics?: string;
}

export interface DecarbonizationResults {
  totalGenerationTwh: number;
  simulatedFossilGenerationTwh: number;
  simulatedTargetFuelGenerationTwh: number;
  simulatedCleanGenerationTwh: number;
  simulatedCleanPowerSharePct: number;
  simulatedPowerSectorEmissionsMt?: number | null;
  simulatedGridCarbonIntensityGco2PerKwh?: number | null;
  simulatedNationalTotalEmissionsMt?: number | null;
  emissionsBoundaryNote?: string | null;
  totalRequestedCleanGenerationTwh?: number;
  totalDisplacedFossilGenerationTwh?: number;
  totalUnusedCleanGenerationTwh?: number;
  simulatedCoalGenerationTwh?: number;
  simulatedGasGenerationTwh?: number;
  simulatedOilGenerationTwh?: number;
  constraintsApplied?: boolean;
  constraintEnforcementSummary?: string;
}

export interface DecarbonizationImpact {
  grossAvoidedEmissionsMt: number;
  cleanReplacementLifecycleEmissionsMt: number;
  netAvoidedEmissionsMt: number;
  netAvoidedEmissionsTonnes: number;
  powerSectorEmissionsReductionPct?: number | null;
  nationalEmissionsReductionPct?: number | null;
  gridIntensityDeltaGco2PerKwh?: number | null;
  cleanShareDeltaPct: number;

  avoidedDirectEmissionsMt: number;
  simulatedDirectPowerEmissionsMt?: number | null;
  simulatedDirectGridIntensityGco2PerKwh?: number | null;

  grossDisplacedLifecycleMt: number;
  cleanEmbodiedLifecycleMt: number;
  netAvoidedLifecycleMt: number;
  netNegativeAbatement: boolean;
  netAbatementWarning?: string | null;
  simulatedMetricsUnavailableReason?: string | null;
  sensitivityInterval?: SensitivityInterval | null;
  itemizedInterventions?: InterventionResult[];
  totalDisplacedFossilGenerationTwh?: number;
  totalUnusedCleanGenerationTwh?: number;
  constraintsApplied?: boolean;
  dispatchConstraintSummary?: string;
}

export interface SensitivityInterval {
  minAvoidedEmissionsMt: number;
  medianAvoidedEmissionsMt: number;
  maxAvoidedEmissionsMt: number;
  displacedFactorMinGco2PerKwh: number;
  displacedFactorMedianGco2PerKwh: number;
  displacedFactorMaxGco2PerKwh: number;
  replacementFactorMinGco2PerKwh: number;
  replacementFactorMedianGco2PerKwh: number;
  replacementFactorMaxGco2PerKwh: number;
  emissionFactorUnit: string;
  emissionsUnit: string;
  uncertaintyDescription?: string;
  sourceCitation?: string;
  publicationYear?: number;
  accountingBoundary?: string;
}

export interface ScenarioAssumptions {
  displacedFuel: string;
  displacedGenerationTwh: number;
  displacedGenerationGwh: number;
  displacedEmissionFactorGco2PerKwh: number;
  displacedFactorSource: string;
  displacedFactorPublicationYear: number;
  displacedFactorBoundary?: string;
  displacedFactorRange?: string;

  replacementSource: string;
  replacementGenerationTwh: number;
  replacementGenerationGwh: number;
  replacementEmissionFactorGco2PerKwh: number;
  replacementFactorSource: string;
  replacementFactorPublicationYear: number;
  replacementFactorBoundary?: string;
  replacementFactorRange?: string;

  gwpConvention?: string;
  geographicAccountingScope?: string;
  dispatchEquivalenceCaveat?: string;
  documentedExclusions?: string[];

  customDisplacedFactor: boolean;
  customDisplacedFactorSource?: string;
  customReplacementFactor: boolean;
  customReplacementFactorSource?: string;

  configuredInterventions?: ScenarioIntervention[];
  configuredConstraints?: ScenarioConstraints;
  dispatchConstraintDescription?: string;
}

export interface DecarbonizationScenarioResponse {
  countryCode: string;
  countryName: string;
  interventionName: string;
  accountingBoundary: string;
  boundaryDescription: string;
  baseline: DecarbonizationBaseline;
  scenario: DecarbonizationResults;
  impact: DecarbonizationImpact;
  assumptions: ScenarioAssumptions;
  calculationMethod: string;
  formula: string;
  accountingStandard: string;
  limitations: string[];
  provenance: ProvenanceDto;
  timestamp: string;
}

export interface SimulatorErrorResponse {
  error: string;
  message: string;
  timestamp: string;
}
