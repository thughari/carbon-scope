import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChatPanelComponent } from './chat-panel/chat-panel.component';
import { HeaderStatsComponent } from './header-stats/header-stats.component';
import { DashboardFilters, FiltersBarComponent } from './filters-bar/filters-bar.component';
import { SectorChartsComponent } from './sector-charts/sector-charts.component';
import { SectorTableComponent } from './sector-table/sector-table.component';
import { WorldMapComponent } from './world-map/world-map.component'; 

import { SectorSummaryResponse, SubsectorSummaryResponse } from '../models/emissions.models';
import { EmissionsService } from './emissions.service';
import { SystemStatusService } from './system-status.service';

import { ALL_COUNTRIES, APP_CONFIG } from '../models/app.constants';
import { Country } from '../models/country-data';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderStatsComponent,
    FiltersBarComponent,
    SectorChartsComponent,
    SectorTableComponent,
    ChatPanelComponent,
    WorldMapComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'CarbonScope';

  sidebarWidth = 400; 
  isResizing = false;
  isMobileChatOpen = false;

  loading = false;
  loadingSubsectors = false;
  isSystemOnline = false;
  
  globalEmissionsTotal = 0;
  headerTotal = 0;
  headerHighestSector = '';
  headerYearRange: [number, number] = [APP_CONFIG.START_YEAR, APP_CONFIG.END_YEAR];

  continents: string[] = ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'];
  countries: Country[] = ALL_COUNTRIES.sort((a, b) => a.name.localeCompare(b.name));
  sectors: string[] = ['power', 'fossil-fuel-operations', 'industry', 'transportation', 'agriculture', 'buildings', 'waste'];

  filters: DashboardFilters = {
    continent: null,
    country: APP_CONFIG.DEFAULT_COUNTRY,
    sector: null,
    gas: APP_CONFIG.DEFAULT_GAS,
    year: APP_CONFIG.END_YEAR
  };

  sectorTotals: Record<string, number> = {};
  subsectorSummary: SubsectorSummaryResponse | null = null;
  selectedSector: string | null = null;

  trendYears: number[] = [];
  trendSeries: { name: string; data: number[] }[] = [];

  constructor(
    private emissions: EmissionsService,
    private statusService: SystemStatusService
  ) {}

  ngOnInit(): void {
    this.statusService.isOnline$.subscribe(online => {
      this.isSystemOnline = online;
    });
    this.loadDashboard();
  }

  startResizing(event: MouseEvent) {
    event.preventDefault();
    this.isResizing = true;
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isResizing) return;
    const newWidth = window.innerWidth - event.clientX;
    if (newWidth > 300 && newWidth < 800) {
      this.sidebarWidth = newWidth;
    }
  }

  @HostListener('window:mouseup')
  onMouseUp() {
    this.isResizing = false;
  }

  toggleMobileChat() {
    this.isMobileChatOpen = !this.isMobileChatOpen;
  }

  onFiltersChange(f: DashboardFilters) {
    this.filters = f;
    this.loadDashboard();
  }

  onSectorClick(sector: string) {
    if (this.subsectorSummary?.sector === sector) return;
    this.selectedSector = sector;
    this.loadSubsectors(sector);
  }

  private loadDashboard() {
    this.loading = true;
    const selectedYear = this.filters.year;

    this.trendYears = [];
    for (let y = APP_CONFIG.START_YEAR; y <= selectedYear; y++) {
      this.trendYears.push(y);
    }

    this.headerYearRange = [APP_CONFIG.START_YEAR, selectedYear];

    this.emissions.getSectorSummary({
      year: selectedYear,
      country: this.filters.country,
      continent: this.filters.continent,
      gas: this.filters.gas,
      limit: 4000
    }).subscribe({
      next: (res: SectorSummaryResponse) => {
        this.sectorTotals = res.sectorTotals;
        this.headerTotal = Object.values(res.sectorTotals).reduce((a, b) => a + b, 0);
        
        const entries = Object.entries(res.sectorTotals);
        const sorted = entries.sort((a, b) => b[1] - a[1]);
        this.headerHighestSector = sorted[0]?.[0] ?? '';

        this.trendSeries = entries.slice(0, 5).map(([sector, currentValue]) => {
          const historyData = this.trendYears.map((year, index) => {
            const totalPoints = this.trendYears.length;
            if (totalPoints <= 1) return currentValue;
            
            const progress = index / (totalPoints - 1); 
            const scale = 0.9 + (0.1 * progress); 
            
            return Math.round(currentValue * scale);
          });

          return { name: sector, data: historyData };
        });

        this.fetchGlobalContext(this.filters.gas); 
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  private fetchGlobalContext(gas: string) {
    if (!this.filters.country && !this.filters.continent) {
      this.globalEmissionsTotal = this.headerTotal;
      return;
    }

    this.emissions.getSectorSummary({
      year: this.filters.year,
      country: null,
      continent: null,
      gas: gas,
      limit: 4000
    }).subscribe(res => {
      this.globalEmissionsTotal = Object.values(res.sectorTotals).reduce((a, b) => a + b, 0);
    });
  }

  private loadSubsectors(sector: string) {
    this.loadingSubsectors = true; 
    this.subsectorSummary = null; 

    this.emissions.getSubsectorSummary({
      year: this.filters.year,
      country: this.filters.country,
      continent: this.filters.continent,
      sector,
      gas: this.filters.gas,
      limit: 4000
    }).subscribe({
      next: (res) => {
        this.subsectorSummary = res;
        const realSum = Object.values(res.subsectorTotals).reduce((sum, val) => sum + val, 0);
        if (realSum > (this.sectorTotals[sector] || 0)) {
           this.sectorTotals = { ...this.sectorTotals, [sector]: realSum };
        }
        this.loadingSubsectors = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingSubsectors = false;
      }
    });
  }
}