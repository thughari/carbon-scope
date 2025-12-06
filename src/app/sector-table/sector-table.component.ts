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
    energy: 'Power generation, oil & gas, and other fuel combustion.',
    power: 'Utility-scale and captive electricity generation.',
    transport: 'Road, air, rail and shipping.',
    transportation: 'All transportation-related emissions.',
    industry: 'Manufacturing and industrial processes.',
    agriculture: 'Agriculture, forestry, and land use.',
    buildings: 'Residential and commercial buildings.',
    waste: 'Landfills, wastewater and other waste.',
    'fossil-fuel-operations': 'Oil, gas, coal extraction and processing.',
  };

  toggleRow(sector: string) {
    if (this.expandedSector === sector) {
      this.expandedSector = null;
    } else {
      this.expandedSector = sector;
      this.sectorClick.emit(sector);
    }
  }

  downloadCSV() {
    if (!this.sectorTotals) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Sector,Emissions (Tonnes)\n';

    Object.entries(this.sectorTotals).forEach(([sector, value]) => {
      const cleanName = sector.charAt(0).toUpperCase() + sector.slice(1);
      csvContent += `${cleanName},${value}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);

    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `carbonscope_data_${date}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
