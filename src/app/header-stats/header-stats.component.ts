import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  @Input() yearRange: [number, number] = [2015, 2024];
  @Input() selectedGas = 'co2e_100yr';

  percentage = 0;

  ngOnChanges() {
    this.calculatePercentage();
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
