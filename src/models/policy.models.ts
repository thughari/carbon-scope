import { ProvenanceDto } from './emissions.models';

export interface InterventionEvidence {
  technologyId: string;
  displayName: string;
  category: 'CLEAN_GENERATION' | 'FOSSIL_DISPLACEMENT' | string;
  directFactorGco2PerKwh: number;
  lifecycleFactorMedianGco2PerKwh: number;
  lifecycleFactorMinGco2PerKwh: number;
  lifecycleFactorMaxGco2PerKwh: number;
  emissionFactorUnit: string;
  sourceCitation: string;
  publicationYear: number;
  accountingBoundary: string;
  technologyScope: string;
  geographicApplicability: string;
  dataQualityRating: string;
  isProvisional: boolean;
  provisionalWarning?: string | null;
  physicalLimitations: string[];
  lcoeDataAvailable: boolean;
  lcoeUnavailableReason?: string | null;
  capacityFactorDataAvailable: boolean;
  capacityFactorUnavailableReason?: string | null;
}

export interface NdcTarget {
  id: string;
  targetTitle: string;
  targetType: 'INTENSITY_GDP' | 'RENEWABLE_SHARE_CAPACITY' | 'RENEWABLE_SHARE_GENERATION' | 'ABSOLUTE_REDUCTION' | string;
  targetClassification?: 'OFFICIAL_NDC_COMMITMENT' | 'JOINT_EU_NDC_COMMITMENT' | 'DOMESTIC_POLICY_LAW' | 'OTHER_OFFICIAL_SOURCE' | 'REQUIRES_REVIEW' | string;
  targetCurrencyStatus?: 'ACTIVE_LATEST_COMMITMENT' | 'HISTORICAL_INTERMEDIATE_TARGET' | 'STATUTORY_DOMESTIC' | 'REQUIRES_REVIEW' | string;
  targetYear: number;
  baselineYear?: number | null;
  commitmentStatus: 'UNCONDITIONAL' | 'CONDITIONAL' | string;
  targetValue?: number | null;
  targetValueConditional?: number | null;
  targetRange?: string | null;
  targetUnit: string;
  sectorScope: 'ECONOMY_WIDE' | 'POWER_SECTOR' | 'ENERGY_SECTOR' | string;
  gasesCovered?: string[];
  officialDescription: string;
  powerSectorImplication?: string;
  interpretationCaveats?: string[];
  legalBasisCitation?: string;
  verificationDate?: string;
}

export interface CountryNdcProfile {
  countryCode: string;
  countryName: string;
  documentTitle: string;
  submissionDate: string;
  latestSubmissionDate?: string;
  activeNdcCycle?: string;
  previousSubmissionsSummary?: string;
  unfcccRegistryUrl: string;
  documentLanguage: string;
  longTermGoal: string;
  targetYearPrimary: number;
  targets: NdcTarget[];
  generalCaveats?: string[];
  policyReviewStatus?: 'VERIFIED_ACTIVE' | 'JOINT_EU_FULFILMENT' | 'WITHDRAWN_PARIS_AGREEMENT' | 'REQUIRES_REVIEW' | string;
  treatyParticipationStatus?: 'PARTY_ACTIVE' | 'WITHDRAWN_NON_PARTY' | 'PARTY_JOINT_EU' | string;
  treatyWithdrawalEffectiveDate?: string | null;
  verificationDate?: string;
  provenance: ProvenanceDto;
}

export interface ScenarioNdcComparison {
  countryCode: string;
  countryName: string;
  scenarioName: string;
  requestedCleanTwh: number;
  displacedFossilTwh: number;
  avoidedDirectMt: number;
  netAvoidedLifecycleMt: number;
  baselineCleanSharePct: number;
  simulatedCleanSharePct: number;
  cleanShareDeltaPct: number;
  hasPowerSectorTarget: boolean;
  comparedTargetTitle?: string;
  comparedTargetClassification?: string;
  comparedTargetCurrencyStatus?: string;
  targetPowerCleanGenerationSharePct?: number | null;
  targetPowerCapacitySharePct?: number | null;
  targetPowerCleanSharePct?: number | null;
  cleanShareDistanceToTargetPct?: number | null;
  comparabilityStatus?: 'GENERATION_METRIC_COMPARABLE' | 'NON_COMPARABLE_CAPACITY_VS_GENERATION' | 'NON_COMPARABLE_ECONOMY_WIDE_GDP_INTENSITY' | 'NON_COMPARABLE_ECONOMY_WIDE_NET_GHG' | string;
  alignmentStatus: 'GENERATION_METRIC_COMPARABLE' | 'METRIC_MISMATCH_CAPACITY_VS_GENERATION' | 'SCOPE_MISMATCH_ECONOMY_WIDE_GDP' | 'DIFFERENT_SECTORAL_BOUNDARY' | 'POWER_TARGET_DOCUMENTED' | 'POLICY_COMMITMENT_DOCUMENTED' | string;
  alignmentSummary: string;
  scopeMismatchExplanation: string;
  methodologicalCaveats: string[];
}

export interface PolicyComparisonResponse {
  interventions: InterventionEvidence[];
  countryNdc: CountryNdcProfile;
  scenarioComparison?: ScenarioNdcComparison | null;
  methodologyNote: string;
  timestamp: string;
}
