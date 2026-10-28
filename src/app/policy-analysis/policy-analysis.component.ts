import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmissionsService } from '../emissions.service';
import {
  CountryNdcProfile,
  InterventionEvidence,
  NdcTarget,
  PolicyComparisonResponse,
  ScenarioNdcComparison
} from '../../models/policy.models';
import { DecarbonizationScenarioResponse } from '../../models/simulator.models';

@Component({
  selector: 'app-policy-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './policy-analysis.component.html',
  styleUrls: ['./policy-analysis.component.scss']
})
export class PolicyAnalysisComponent implements OnInit, OnChanges {
  @Input() initialCountryCode = 'IND';
  @Input() scenario: DecarbonizationScenarioResponse | null = null;
  @Output() navigateToSimulator = new EventEmitter<void>();
  @Output() countryChanged = new EventEmitter<string>();

  selectedCountry = 'IND';
  activeSubTab: 'all' | 'evidence' | 'ndc' | 'comparison' = 'all';
  selectedCategory: 'ALL' | 'CLEAN_GENERATION' | 'FOSSIL_DISPLACEMENT' = 'ALL';
  expandedTechId: string | null = 'SOLAR_PV';

  loading = false;
  comparingScenario = false;
  errorMessage: string | null = null;

  interventions: InterventionEvidence[] = [];
  countryNdc: CountryNdcProfile | null = null;
  allNdcProfiles: CountryNdcProfile[] = [];
  scenarioComparison: ScenarioNdcComparison | null = null;
  methodologyNote = '';

  constructor(private emissionsService: EmissionsService) {}

  ngOnInit(): void {
    if (this.initialCountryCode) {
      this.selectedCountry = this.initialCountryCode.toUpperCase();
    }
    this.loadPolicyData();
    this.loadAllNdcProfiles();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialCountryCode'] && !changes['initialCountryCode'].firstChange) {
      const newCountry = changes['initialCountryCode'].currentValue;
      if (newCountry && newCountry !== this.selectedCountry) {
        this.selectedCountry = newCountry.toUpperCase();
        this.loadPolicyData();
      }
    }

    if (changes['scenario'] && this.scenario) {
      this.evaluateScenarioAgainstNdc(this.scenario);
    }
  }

  loadPolicyData(): void {
    this.loading = true;
    this.errorMessage = null;

    this.emissionsService.getPolicyOverview(this.selectedCountry).subscribe({
      next: (response: PolicyComparisonResponse) => {
        this.interventions = response.interventions || [];
        this.countryNdc = response.countryNdc || null;
        this.methodologyNote = response.methodologyNote || '';
        this.loading = false;

        // If scenario is already active, evaluate comparison
        if (this.scenario && this.scenario.countryCode === this.selectedCountry) {
          this.evaluateScenarioAgainstNdc(this.scenario);
        } else if (response.scenarioComparison) {
          this.scenarioComparison = response.scenarioComparison;
        } else {
          this.scenarioComparison = null;
        }
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Failed to load policy analysis and NDC data.';
        this.loading = false;
      }
    });
  }

  loadAllNdcProfiles(): void {
    this.emissionsService.getNdcProfiles().subscribe({
      next: (profiles: CountryNdcProfile[]) => {
        this.allNdcProfiles = profiles || [];
      },
      error: () => {
        // Fallback or silent fail; overview provides individual country NDC
      }
    });
  }

  onCountrySelect(countryCode: string): void {
    if (countryCode && countryCode !== this.selectedCountry) {
      this.selectedCountry = countryCode.toUpperCase();
      this.countryChanged.emit(this.selectedCountry);
      this.loadPolicyData();
    }
  }

  toggleTechAccordion(techId: string): void {
    this.expandedTechId = this.expandedTechId === techId ? null : techId;
  }

  filterInterventions(category: 'ALL' | 'CLEAN_GENERATION' | 'FOSSIL_DISPLACEMENT'): void {
    this.selectedCategory = category;
  }

  get filteredInterventions(): InterventionEvidence[] {
    if (this.selectedCategory === 'ALL') {
      return this.interventions;
    }
    return this.interventions.filter(item => item.category === this.selectedCategory);
  }

  evaluateScenarioAgainstNdc(scenario: DecarbonizationScenarioResponse): void {
    this.comparingScenario = true;
    this.emissionsService.compareScenarioWithNdc(scenario).subscribe({
      next: (comp: ScenarioNdcComparison) => {
        this.scenarioComparison = comp;
        this.comparingScenario = false;
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Failed to evaluate scenario against national NDC.';
        this.comparingScenario = false;
      }
    });
  }

  goToSimulator(): void {
    this.navigateToSimulator.emit();
  }

  getCategoryBadgeClass(category: string): string {
    return category === 'CLEAN_GENERATION'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
      : 'bg-rose-500/10 text-rose-400 border-rose-500/25';
  }

  getTargetTypeBadgeClass(targetType: string): string {
    switch (targetType) {
      case 'INTENSITY_GDP':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/25';
      case 'RENEWABLE_SHARE_CAPACITY':
        return 'bg-sky-500/10 text-sky-300 border-sky-500/25';
      case 'RENEWABLE_SHARE_GENERATION':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
      case 'ABSOLUTE_REDUCTION':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25';
      default:
        return 'bg-slate-800 text-slate-300 border-white/10';
    }
  }

  getAlignmentBadgeClass(status: string): string {
    switch (status) {
      case 'GENERATION_METRIC_COMPARABLE':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'METRIC_MISMATCH_CAPACITY_VS_GENERATION':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'SCOPE_MISMATCH_ECONOMY_WIDE_GDP':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'DIFFERENT_SECTORAL_BOUNDARY':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'WITHDRAWN_TREATY_NON_PARTY':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-white/10';
    }
  }

  getAlignmentIcon(status: string): string {
    switch (status) {
      case 'GENERATION_METRIC_COMPARABLE':
        return 'check-circle';
      case 'METRIC_MISMATCH_CAPACITY_VS_GENERATION':
      case 'SCOPE_MISMATCH_ECONOMY_WIDE_GDP':
      case 'DIFFERENT_SECTORAL_BOUNDARY':
      case 'WITHDRAWN_TREATY_NON_PARTY':
        return 'exclamation-triangle';
      default:
        return 'info-circle';
    }
  }

  getClassificationBadgeClass(classification?: string): string {
    switch (classification) {
      case 'OFFICIAL_NDC_COMMITMENT':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'JOINT_EU_NDC_COMMITMENT':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'DOMESTIC_POLICY_LAW':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'OTHER_OFFICIAL_SOURCE':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'REQUIRES_REVIEW':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-white/10';
    }
  }

  getClassificationLabel(classification?: string): string {
    switch (classification) {
      case 'OFFICIAL_NDC_COMMITMENT':
        return 'Official NDC';
      case 'JOINT_EU_NDC_COMMITMENT':
        return 'Joint EU NDC';
      case 'DOMESTIC_POLICY_LAW':
        return 'National Law / Policy';
      case 'OTHER_OFFICIAL_SOURCE':
        return 'Multilateral Agreement';
      case 'REQUIRES_REVIEW':
        return 'Policy Review';
      default:
        return 'Commitment';
    }
  }

  getCurrencyBadgeClass(status?: string): string {
    switch (status) {
      case 'ACTIVE_LATEST_COMMITMENT':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'HISTORICAL_INTERMEDIATE_TARGET':
        return 'bg-slate-700/60 text-slate-300 border-white/10';
      case 'STATUTORY_DOMESTIC':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'HISTORICAL_SUPERSEDED_OR_WITHDRAWN':
      case 'REQUIRES_REVIEW':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-white/10';
    }
  }

  getCurrencyLabel(status?: string): string {
    switch (status) {
      case 'ACTIVE_LATEST_COMMITMENT':
        return 'Active 2035';
      case 'HISTORICAL_INTERMEDIATE_TARGET':
        return '2030 Milestone';
      case 'STATUTORY_DOMESTIC':
        return 'Statutory';
      case 'HISTORICAL_SUPERSEDED_OR_WITHDRAWN':
        return 'Historical (Withdrawn)';
      case 'REQUIRES_REVIEW':
        return 'Review Required';
      default:
        return 'Target';
    }
  }
}

