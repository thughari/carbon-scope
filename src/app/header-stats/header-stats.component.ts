import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APP_CONFIG } from '../../models/app.constants';

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

  percentage = 0;

  ngOnChanges() {
    this.calculatePercentage();
  }

  get formattedHighestSector(): string {
    if (!this.highestSector) return '--';
    
    const map: Record<string, string> = {
      'fossil-fuel-operations': 'Fossil Fuels',
      'forestry-and-land-use': 'Forestry & Land',
      'mineral-extraction': 'Mineral Extraction',
      'transportation': 'Transportation',
      'agriculture': 'Agriculture',
      'power': 'Power Sector',
      'waste': 'Waste Management'
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
    if (!this.globalTotal || this.globalTotal === 0) {
      this.percentage = 0;
      return;
    }
    this.percentage = Math.min(
      100,
      (this.totalEmissions / this.globalTotal) * 100
    );
  }

  get isLatestYear(): boolean {
    return this.yearRange[1] === APP_CONFIG.END_YEAR;
  }

  private gasMap: Record<string, string> = {
    co2e_100yr: 'Aggregated CO₂e (100yr)',
    co2e_20yr: 'Aggregated CO₂e (20yr)',
    co2: 'Carbon Dioxide (CO₂)',
    ch4: 'Methane (CH₄)',
    n2o: 'Nitrous Oxide (N₂O)',
  };

  get gasLabel(): string {
    return this.gasMap[this.selectedGas] || 'Emissions';
  }
}