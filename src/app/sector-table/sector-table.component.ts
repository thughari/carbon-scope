import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubsectorSummaryResponse } from '../../models/emissions.models';

@Component({
  selector: 'app-sector-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sector-table.component.html',
  styleUrls: ['./sector-table.component.scss'],
})
export class SectorTableComponent {
  @Input() sectorTotals: Record<string, number> = {};
  @Input() subsectorData: SubsectorSummaryResponse | null = null;
  @Input() isLoadingSubsectors = false;
  @Output() sectorClick = new EventEmitter<string>();

  expandedSector: string | null = null;

  sectorDescriptions: Record<string, string> = {
    energy: 'Power generation, oil & gas combustion, and energy conversion processes.',
    power: 'Utility-scale electricity generation, grid transmission, and thermal heat plants.',
    transport: 'Road vehicles, commercial aviation, maritime shipping, and rail networks.',
    transportation: 'Comprehensive domestic and international transit greenhouse gases.',
    industry: 'Heavy manufacturing, cement kilns, blast furnaces, and chemical processing.',
    agriculture: 'Livestock enteric fermentation, rice paddies, and synthetic fertilizer application.',
    buildings: 'Residential space heating, cooling, hot water, and commercial real estate.',
    waste: 'Municipal solid waste landfills, open incinerators, and wastewater treatment.',
    'fossil-fuel-operations': 'Upstream crude extraction, refining, pipeline transport, and coal mining.',
    'forestry-and-land-use': 'Land clearing, deforestation, peat fires, and carbon removal sinks.',
    'mineral-extraction': 'Bauxite, copper, iron ore mining, and quarrying operations.',
  };

  toggleRow(sector: string) {
    if (this.expandedSector === sector) {
      this.expandedSector = null;
    } else {
      this.expandedSector = sector;
      this.sectorClick.emit(sector);
    }
  }

  getTotalEmissions(): number {
    if (!this.sectorTotals) return 0;
    return Object.values(this.sectorTotals).reduce((a, b) => a + b, 0);
  }

  getSectorPercentage(val: number): number {
    const total = this.getTotalEmissions();
    return total > 0 ? (val / total) * 100 : 0;
  }

  downloadCSV() {
    if (!this.sectorTotals) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Sector,Emissions (Mt CO2e),Emissions (Tonnes),Share (%)\n';

    const total = this.getTotalEmissions();

    Object.entries(this.sectorTotals).forEach(([sector, value]) => {
      const cleanName = sector.charAt(0).toUpperCase() + sector.slice(1);
      const valMt = (value / 1_000_000.0).toFixed(2);
      const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
      csvContent += `"${cleanName}",${valMt},${value.toFixed(0)},${pct}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);

    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `carbonscope_sectors_${date}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
