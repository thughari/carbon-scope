import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmissionsService } from '../emissions.service';
import {
  CountryElectricityProfile,
  DecarbonizationScenarioRequest,
  DecarbonizationScenarioResponse,
  ScenarioIntervention,
  ScenarioConstraints,
  InterventionResult,
} from '../../models/simulator.models';

@Component({
  selector: 'app-decarbonization-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './decarbonization-simulator.component.html',
  styleUrls: ['./decarbonization-simulator.component.scss'],
})
export class DecarbonizationSimulatorComponent implements OnInit {
  @Input() initialCountryCode = 'IND';
  @Output() closeSimulator = new EventEmitter<void>();
  @Output() scenarioCalculated = new EventEmitter<DecarbonizationScenarioResponse>();
  @Output() openPolicyComparison = new EventEmitter<void>();

  countries: CountryElectricityProfile[] = [];
  selectedCountry: CountryElectricityProfile | null = null;
  selectedCountryCode = 'IND';

  accountingBoundary: 'OPERATIONAL_SCOPE_1' | 'LIFECYCLE_SCOPE_1_2_3' = 'OPERATIONAL_SCOPE_1';

  interventions: ScenarioIntervention[] = [
    {
      id: 'intervention-1',
      cleanSource: 'SOLAR_PV',
      targetDisplacedFuel: 'COAL',
      generationAmount: 50.0,
      generationUnit: 'TWH',
      customDisplacedEmissionFactor: null,
      customDisplacedFactorSource: '',
      customReplacementEmissionFactor: null,
      customReplacementFactorSource: '',
    },
  ];

  // Dispatch and Physical Constraints
  showConstraints = false;
  minResidualCoalTwh: number | null = null;
  minResidualGasTwh: number | null = null;
  minResidualOilTwh: number | null = null;
  minResidualFossilTwh: number | null = null;
  maxCleanAdditionLimitTwh: number | null = null;

  showAdvancedFactors = false;

  loadingCountries = false;
  calculating = false;
  errorMessage: string | null = null;
  result: DecarbonizationScenarioResponse | null = null;

  readonly fuelOptions = [
    {
      id: 'COAL',
      label: 'Coal',
      operationalFactor: 950,
      lifecycleFactor: 820,
      description: 'Pulverized coal fleet (IPCC AR5 Table A.III.2 median: 820 gCO₂eq/kWh)',
    },
    {
      id: 'FOSSIL_GAS',
      label: 'Fossil Gas (CCGT)',
      operationalFactor: 410,
      lifecycleFactor: 490,
      description: 'Combined Cycle Gas Turbine (IPCC AR5 Table A.III.2 median: 490 gCO₂eq/kWh)',
    },
    {
      id: 'OIL',
      label: 'Oil / Diesel Peakers (Provisional LCA)',
      operationalFactor: 720,
      lifecycleFactor: 750,
      description: 'Liquid peakers (PROVISIONAL: not in Table A.III.2, 750 gCO₂e/kWh)',
    },
    {
      id: 'GRID_FOSSIL_MIX',
      label: 'National Grid Fossil Mix',
      operationalFactor: null,
      lifecycleFactor: null,
      description: 'Weighted average intensity of national fossil fleet',
    },
  ];

  readonly cleanOptions = [
    {
      id: 'SOLAR_PV',
      label: 'Solar PV (Utility-scale)',
      operationalFactor: 0,
      lifecycleFactor: 48,
      description: 'Crystalline silicon ground mount (IPCC AR5 Table A.III.2 median)',
    },
    {
      id: 'WIND_ONSHORE',
      label: 'Onshore Wind',
      operationalFactor: 0,
      lifecycleFactor: 11,
      description: 'Modern terrestrial turbines (IPCC AR5 Table A.III.2 median)',
    },
    {
      id: 'WIND_OFFSHORE',
      label: 'Offshore Wind',
      operationalFactor: 0,
      lifecycleFactor: 12,
      description: 'Marine fixed-bottom/floating (IPCC AR5 Table A.III.2 median)',
    },
    {
      id: 'NUCLEAR',
      label: 'Nuclear Power',
      operationalFactor: 0,
      lifecycleFactor: 12,
      description: 'Light water reactor lifecycle (IPCC AR5 Table A.III.2 median)',
    },
    {
      id: 'HYDRO',
      label: 'Hydroelectricity',
      operationalFactor: 0,
      lifecycleFactor: 24,
      description: 'Run-of-river & reservoir median (IPCC AR5 Table A.III.2 median)',
    },
  ];

  constructor(private emissionsService: EmissionsService) {}

  ngOnInit() {
    this.loadCountries();
  }

  // --- Two-way accessors for primary intervention (backward compatibility) ---
  get displacedFuel(): string {
    return this.interventions[0]?.targetDisplacedFuel || 'COAL';
  }
  set displacedFuel(val: string) {
    if (this.interventions.length > 0) {
      this.interventions[0].targetDisplacedFuel = val;
    }
  }

  get replacementCleanSource(): string {
    return this.interventions[0]?.cleanSource || 'SOLAR_PV';
  }
  set replacementCleanSource(val: string) {
    if (this.interventions.length > 0) {
      this.interventions[0].cleanSource = val;
    }
  }

  get generationAmount(): number {
    return this.interventions[0]?.generationAmount ?? 50.0;
  }
  set generationAmount(val: number) {
    if (this.interventions.length > 0) {
      this.interventions[0].generationAmount = val;
    }
  }

  get generationUnit(): string {
    return this.interventions[0]?.generationUnit || 'TWH';
  }
  set generationUnit(val: string) {
    if (this.interventions.length > 0) {
      this.interventions[0].generationUnit = val;
    }
  }

  get customDisplacedFactor(): number | null {
    return this.interventions[0]?.customDisplacedEmissionFactor ?? null;
  }
  set customDisplacedFactor(val: number | null) {
    if (this.interventions.length > 0) {
      this.interventions[0].customDisplacedEmissionFactor = val;
    }
  }

  get customDisplacedFactorSource(): string {
    return this.interventions[0]?.customDisplacedFactorSource ?? '';
  }
  set customDisplacedFactorSource(val: string) {
    if (this.interventions.length > 0) {
      this.interventions[0].customDisplacedFactorSource = val;
    }
  }

  get customReplacementFactor(): number | null {
    return this.interventions[0]?.customReplacementEmissionFactor ?? null;
  }
  set customReplacementFactor(val: number | null) {
    if (this.interventions.length > 0) {
      this.interventions[0].customReplacementEmissionFactor = val;
    }
  }

  get customReplacementFactorSource(): string {
    return this.interventions[0]?.customReplacementFactorSource ?? '';
  }
  set customReplacementFactorSource(val: string) {
    if (this.interventions.length > 0) {
      this.interventions[0].customReplacementFactorSource = val;
    }
  }

  // --- Multi-Intervention Management ---
  addIntervention() {
    const nextIndex = this.interventions.length + 1;
    const cleanList = ['WIND_ONSHORE', 'SOLAR_PV', 'WIND_OFFSHORE', 'NUCLEAR', 'HYDRO'];
    const fuelList = ['FOSSIL_GAS', 'COAL', 'OIL', 'GRID_FOSSIL_MIX'];
    const nextClean = cleanList[(nextIndex - 1) % cleanList.length];
    const nextFuel = fuelList[(nextIndex - 1) % fuelList.length];

    this.interventions.push({
      id: `intervention-${nextIndex}`,
      cleanSource: nextClean,
      targetDisplacedFuel: nextFuel,
      generationAmount: 20.0,
      generationUnit: 'TWH',
      customDisplacedEmissionFactor: null,
      customDisplacedFactorSource: '',
      customReplacementEmissionFactor: null,
      customReplacementFactorSource: '',
    });
    this.runSimulation();
  }

  removeIntervention(index: number) {
    if (this.interventions.length <= 1) return;
    this.interventions.splice(index, 1);
    this.runSimulation();
  }

  get totalRequestedCleanTwh(): number {
    return this.interventions.reduce((sum, item) => {
      const amt = Number(item.generationAmount) || 0;
      const twh = item.generationUnit === 'GWH' ? amt / 1000.0 : amt;
      return sum + twh;
    }, 0);
  }

  resetConstraints() {
    this.minResidualCoalTwh = null;
    this.minResidualGasTwh = null;
    this.minResidualOilTwh = null;
    this.minResidualFossilTwh = null;
    this.maxCleanAdditionLimitTwh = null;
    this.runSimulation();
  }

  loadCountries() {
    this.loadingCountries = true;
    this.errorMessage = null;

    this.emissionsService.getSimulatorCountries().subscribe({
      next: (data) => {
        this.countries = data;
        this.loadingCountries = false;

        const target =
          this.countries.find((c) => c.countryCode === this.initialCountryCode) ||
          this.countries[0];

        if (target) {
          this.selectCountry(target.countryCode);
        }
      },
      error: (err) => {
        this.loadingCountries = false;
        this.errorMessage =
          err?.error?.message ||
          'Failed to load verified country electricity profiles from server.';
      },
    });
  }

  onCountryChange(countryCode: string) {
    this.selectCountry(countryCode);
  }

  selectCountry(countryCode: string) {
    this.selectedCountryCode = countryCode;
    this.selectedCountry =
      this.countries.find((c) => c.countryCode === countryCode) || null;
    this.errorMessage = null;

    if (this.selectedCountry && this.interventions.length === 1) {
      const maxTwh = this.maxAvailableDisplacedTwh;
      if (this.generationAmount > maxTwh && maxTwh > 0) {
        this.generationAmount = Math.min(25, Number(maxTwh.toFixed(1)));
      }
    }

    this.runSimulation();
  }

  setBoundary(boundary: 'OPERATIONAL_SCOPE_1' | 'LIFECYCLE_SCOPE_1_2_3') {
    this.accountingBoundary = boundary;
    this.runSimulation();
  }

  get maxAvailableDisplacedTwh(): number {
    if (!this.selectedCountry) return 0;
    switch (this.displacedFuel) {
      case 'COAL':
        return this.selectedCountry.coalGenerationTwh;
      case 'FOSSIL_GAS':
        return this.selectedCountry.gasGenerationTwh;
      case 'OIL':
        return this.selectedCountry.oilGenerationTwh;
      case 'GRID_FOSSIL_MIX':
        return this.selectedCountry.totalFossilGenerationTwh;
      default:
        return 0;
    }
  }

  get currentRequestedTwh(): number {
    if (!this.generationAmount || this.generationAmount <= 0) return 0;
    return this.generationUnit === 'GWH'
      ? this.generationAmount / 1000.0
      : this.generationAmount;
  }

  get isExceedingAvailable(): boolean {
    if (this.interventions.length > 1 || this.hasAnyConstraintSet) {
      return false; // Engine safely clamps dispatch and reports unused clean generation
    }
    return this.currentRequestedTwh > this.maxAvailableDisplacedTwh + 1e-6;
  }

  get hasAnyConstraintSet(): boolean {
    return (
      this.minResidualCoalTwh !== null ||
      this.minResidualGasTwh !== null ||
      this.minResidualOilTwh !== null ||
      this.minResidualFossilTwh !== null ||
      this.maxCleanAdditionLimitTwh !== null
    );
  }

  getDisplacedFuelFactor(fuelId: string): number {
    if (fuelId === 'GRID_FOSSIL_MIX' && this.selectedCountry) {
      if (this.selectedCountry.totalFossilGenerationTwh > 0) {
        return Math.round(
          (this.selectedCountry.powerSectorEmissionsMt * 1000.0) /
            this.selectedCountry.totalFossilGenerationTwh
        );
      }
      return this.accountingBoundary === 'OPERATIONAL_SCOPE_1' ? 410 : 490;
    }
    const found = this.fuelOptions.find((f) => f.id === fuelId);
    if (!found) return 950;
    return this.accountingBoundary === 'OPERATIONAL_SCOPE_1'
      ? (found.operationalFactor ?? 950)
      : (found.lifecycleFactor ?? 1000);
  }

  getCleanSourceFactor(cleanId: string): number {
    const found = this.cleanOptions.find((c) => c.id === cleanId);
    if (!found) return 0;
    return this.accountingBoundary === 'OPERATIONAL_SCOPE_1'
      ? found.operationalFactor
      : found.lifecycleFactor;
  }

  get defaultDisplacedFactor(): number {
    return this.getDisplacedFuelFactor(this.displacedFuel);
  }

  get defaultReplacementFactor(): number {
    return this.getCleanSourceFactor(this.replacementCleanSource);
  }

  applyPreset(amountTwh: number, cleanSource: string, fossilFuel?: string) {
    this.generationUnit = 'TWH';
    this.replacementCleanSource = cleanSource;
    if (fossilFuel) {
      this.displacedFuel = fossilFuel;
    }

    const maxTwh = this.maxAvailableDisplacedTwh;
    this.generationAmount = Math.min(amountTwh, maxTwh > 0 ? maxTwh : amountTwh);
    this.runSimulation();
  }

  applyPercentagePreset(percentage: number) {
    this.generationUnit = 'TWH';
    const maxTwh = this.maxAvailableDisplacedTwh;
    this.generationAmount = Number(((maxTwh * percentage) / 100.0).toFixed(2));
    this.runSimulation();
  }

  runSimulation() {
    if (!this.selectedCountry) return;

    for (let i = 0; i < this.interventions.length; i++) {
      const item = this.interventions[i];
      if (!item.generationAmount || item.generationAmount <= 0) {
        this.errorMessage = `Intervention generation amount must be greater than zero.`;
        return;
      }
    }

    if (this.isExceedingAvailable) {
      this.errorMessage = `Requested displaced generation (${this.currentRequestedTwh.toFixed(
        2
      )} TWh) exceeds the country's available ${this.displacedFuel} generation (${this.maxAvailableDisplacedTwh.toFixed(
        2
      )} TWh).`;
      return;
    }

    if (this.showAdvancedFactors) {
      if (
        this.customDisplacedFactor !== null &&
        (!this.customDisplacedFactorSource ||
          !this.customDisplacedFactorSource.trim())
      ) {
        this.errorMessage =
          'A documented citation source is required when overriding the displaced fuel emission factor.';
        return;
      }
      if (
        this.customReplacementFactor !== null &&
        (!this.customReplacementFactorSource ||
          !this.customReplacementFactorSource.trim())
      ) {
        this.errorMessage =
          'A documented citation source is required when overriding the replacement clean technology emission factor.';
        return;
      }
    }

    this.calculating = true;
    this.errorMessage = null;

    const constraintsObj: ScenarioConstraints | null = this.hasAnyConstraintSet
      ? {
          minResidualCoalTwh:
            this.minResidualCoalTwh !== null && !isNaN(Number(this.minResidualCoalTwh))
              ? Number(this.minResidualCoalTwh)
              : null,
          minResidualGasTwh:
            this.minResidualGasTwh !== null && !isNaN(Number(this.minResidualGasTwh))
              ? Number(this.minResidualGasTwh)
              : null,
          minResidualOilTwh:
            this.minResidualOilTwh !== null && !isNaN(Number(this.minResidualOilTwh))
              ? Number(this.minResidualOilTwh)
              : null,
          minResidualFossilTwh:
            this.minResidualFossilTwh !== null && !isNaN(Number(this.minResidualFossilTwh))
              ? Number(this.minResidualFossilTwh)
              : null,
          maxCleanAdditionLimitTwh:
            this.maxCleanAdditionLimitTwh !== null && !isNaN(Number(this.maxCleanAdditionLimitTwh))
              ? Number(this.maxCleanAdditionLimitTwh)
              : null,
        }
      : null;

    const req: DecarbonizationScenarioRequest = {
      countryCode: this.selectedCountryCode,
      displacedFuel: this.interventions[0]?.targetDisplacedFuel || 'COAL',
      replacementCleanSource: this.interventions[0]?.cleanSource || 'SOLAR_PV',
      generationAmount: Number(this.interventions[0]?.generationAmount || 50),
      generationUnit: this.interventions[0]?.generationUnit || 'TWH',
      accountingBoundary: this.accountingBoundary,
      customDisplacedEmissionFactor: this.showAdvancedFactors
        ? this.customDisplacedFactor
        : null,
      customDisplacedFactorSource:
        this.showAdvancedFactors && this.customDisplacedFactor !== null
          ? this.customDisplacedFactorSource.trim()
          : null,
      customReplacementEmissionFactor: this.showAdvancedFactors
        ? this.customReplacementFactor
        : null,
      customReplacementFactorSource:
        this.showAdvancedFactors && this.customReplacementFactor !== null
          ? this.customReplacementFactorSource.trim()
          : null,
      interventions: this.interventions.map((item, idx) => ({
        id: item.id || `intervention-${idx + 1}`,
        cleanSource: item.cleanSource,
        generationAmount: Number(item.generationAmount),
        generationUnit: item.generationUnit,
        targetDisplacedFuel: item.targetDisplacedFuel,
        customDisplacedEmissionFactor:
          idx === 0 && this.showAdvancedFactors
            ? this.customDisplacedFactor
            : item.customDisplacedEmissionFactor ?? null,
        customDisplacedFactorSource:
          idx === 0 && this.showAdvancedFactors
            ? this.customDisplacedFactorSource?.trim() || null
            : item.customDisplacedFactorSource?.trim() || null,
        customReplacementEmissionFactor:
          idx === 0 && this.showAdvancedFactors
            ? this.customReplacementFactor
            : item.customReplacementEmissionFactor ?? null,
        customReplacementFactorSource:
          idx === 0 && this.showAdvancedFactors
            ? this.customReplacementFactorSource?.trim() || null
            : item.customReplacementFactorSource?.trim() || null,
      })),
      constraints: constraintsObj,
    };

    this.emissionsService.calculateDecarbonizationScenario(req).subscribe({
      next: (res) => {
        this.result = res;
        this.calculating = false;
        this.emissionsService?.setActiveScenario?.(res);
        this.scenarioCalculated.emit(res);
      },
      error: (err) => {
        this.calculating = false;
        this.errorMessage =
          err?.error?.message ||
          'Simulator rejected calculation due to invalid parameters or physical bounds.';
      },
    });
  }

  resetCustomFactors() {
    this.customDisplacedFactor = null;
    this.customDisplacedFactorSource = '';
    this.customReplacementFactor = null;
    this.customReplacementFactorSource = '';
    this.runSimulation();
  }
}
