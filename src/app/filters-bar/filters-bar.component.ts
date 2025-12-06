import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Country } from '../../models/country-data';

const GAS_OPTIONS = [
  { label: 'CO₂e (100yr)', value: 'co2e_100yr' },
  { label: 'CO₂e (20yr)', value: 'co2e_20yr' },
  { label: 'CO₂ Only', value: 'co2' },
  { label: 'Methane (CH₄)', value: 'ch4' },
  { label: 'Nitrous Oxide (N₂O)', value: 'n2o' },
];

export interface DashboardFilters {
  continent: string | null;
  country: string | null;
  sector: string | null;
  gas: string;
}

@Component({
  selector: 'app-filters-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filters-bar.component.html',
})
export class FiltersBarComponent {
  @Input() continents: string[] = [];
  @Input() countries: Country[] = [];
  @Input() sectors: string[] = [];

  gasOptions = GAS_OPTIONS;

  @Input() filters: DashboardFilters = {
    continent: null,
    country: 'IND',
    sector: null,
    gas: 'co2e_100yr',
  };

  @Output() filtersChange = new EventEmitter<DashboardFilters>();

  onChange(change: Partial<DashboardFilters>) {
    const updatedFilters = { ...this.filters, ...change };

    if ('country' in change && change.country !== null) {
      updatedFilters.continent = null;
    }
    if ('continent' in change && change.continent !== null) {
      updatedFilters.country = null;
    }

    this.filters = updatedFilters;
    this.filtersChange.emit(this.filters);
  }
}
