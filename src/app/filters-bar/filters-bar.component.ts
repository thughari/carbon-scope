import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Country } from '../../models/country-data';
import { APP_CONFIG } from '../../models/app.constants';

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
  year: number;
}

@Component({
  selector: 'app-filters-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filters-bar.component.html',
})
export class FiltersBarComponent implements OnInit{
  @Input() continents: string[] = [];
  @Input() countries: Country[] = [];
  @Input() sectors: string[] = [];

  gasOptions = GAS_OPTIONS;
  years: number[] = [];

  @Input() filters: DashboardFilters = {
    continent: null,
    country: APP_CONFIG.DEFAULT_COUNTRY,
    sector: null,
    gas: APP_CONFIG.DEFAULT_GAS,
    year: APP_CONFIG.END_YEAR
  };

  @Output() filtersChange = new EventEmitter<DashboardFilters>();

  ngOnInit() {
    for (let i = APP_CONFIG.END_YEAR; i >= APP_CONFIG.START_YEAR; i--) {
      this.years.push(i);
    }
  }

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