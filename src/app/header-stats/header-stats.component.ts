import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APP_CONFIG } from '../../models/app.constants';
import { ProvenanceDto } from '../../models/emissions.models';

@Component({
  selector: 'app-header-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-stats.component.html',
  styleUrls: ['./header-stats.component.scss'],
})
export class HeaderStatsComponent implements OnChanges {
  @Input() totalEmissions = 0;
  @Input() globalTotal = 0;
  @Input() highestSector = '';
  @Input() yearRange: [number, number] = [APP_CONFIG.START_YEAR, APP_CONFIG.END_YEAR];
  @Input() selectedGas = APP_CONFIG.DEFAULT_GAS;
  @Input() countryRank: number | null = null;
  @Input() perCapita: number | null = null;
  @Input() gridIntensity: number | null = null;
  @Input() cleanPower: number | null = null;
  @Input() countryName = '';
  @Input() dataSourceStatus = 'LIVE_API_OBSERVATION';
  @Input() isPartialOrProvisional = false;
  @Input() temporalCompleteness: string | null = null;
  @Input() provenance: ProvenanceDto | null = null;
  @Input() dataQualityNotes: string | null = null;

  @Output() viewSourcesClick = new EventEmitter<void>();

  percentage = 0;

  ngOnChanges() {
    this.calculatePercentage();
  }

  get isUnavailable(): boolean {
    return this.dataSourceStatus === 'DATA_UNAVAILABLE';
  }

  get isLiveObservation(): boolean {
    return this.dataSourceStatus === 'LIVE_API_OBSERVATION' || this.dataSourceStatus === 'LIVE_API';
  }

  get isBenchmark(): boolean {
    return this.dataSourceStatus === 'STATIC_REFERENCE_BENCHMARK' || this.dataSourceStatus === 'VERIFIED_BENCHMARK';
  }

  get isPartialYear(): boolean {
    return this.temporalCompleteness === 'PARTIAL_YEAR_OBSERVATION' || (this.yearRange[1] === 2026 && !this.isUnavailable);
  }

  get isProvisionalAnnual(): boolean {
    return (this.temporalCompleteness === 'PROVISIONAL_ANNUAL' || (this.isPartialOrProvisional && !this.isPartialYear)) && !this.isUnavailable;
  }

  get statusLabel(): string {
    if (this.isUnavailable) return 'Data Unavailable';
    if (this.isLiveObservation) return 'Live Satellite Observation';
    if (this.isBenchmark) return 'Reference Benchmark';
    return this.dataSourceStatus;
  }

  get formattedHighestSector(): string {
    if (this.isUnavailable || !this.highestSector) return '--';

    const map: Record<string, string> = {
      'fossil-fuel-operations': 'Fossil Fuels',
      'forestry-and-land-use': 'Forestry & Land',
      'mineral-extraction': 'Mineral Extraction',
      'transportation': 'Transportation',
      'agriculture': 'Agriculture',
      'power': 'Power Generation',
      'waste': 'Waste Management',
      'industry': 'Industrial Processes',
      'buildings': 'Buildings & Heating'
    };

    if (map[this.highestSector]) {
      return map[this.highestSector];
    }

    return this.highestSector
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private calculatePercentage() {
    if (this.isUnavailable || !this.globalTotal || this.globalTotal === 0) {
      this.percentage = 0;
      return;
    }
    this.percentage = (this.totalEmissions / this.globalTotal) * 100.0;
  }

  get gasLabel(): string {
    switch (this.selectedGas) {
      case 'co2e_100yr':
        return 'CO₂e (100-yr GWP AR6)';
      case 'co2e_20yr':
        return 'CO₂e (20-yr GWP AR6)';
      case 'co2':
        return 'Carbon Dioxide (CO₂)';
      case 'ch4':
        return 'Methane (CH₄)';
      case 'n2o':
        return 'Nitrous Oxide (N₂O)';
      default:
        return this.selectedGas;
    }
  }
}