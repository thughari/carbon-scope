import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChatPanelComponent } from './chat-panel/chat-panel.component';
import { HeaderStatsComponent } from './header-stats/header-stats.component';
import { DashboardFilters, FiltersBarComponent } from './filters-bar/filters-bar.component';
import { SectorChartsComponent } from './sector-charts/sector-charts.component';
import { SectorTableComponent } from './sector-table/sector-table.component';
import { WorldMapComponent } from './world-map/world-map.component';

import {
  EmissionsOverviewResponse,
  ProvenanceDto,
  SectorSummaryResponse,
  SourceInfoItem,
  SourcesInfoResponse,
  SubsectorSummaryResponse,
  TrendPoint
} from '../models/emissions.models';
import { EmissionsService } from './emissions.service';
import { SystemStatusService, HealthTelemetry } from './system-status.service';

import { ALL_COUNTRIES, APP_CONFIG } from '../models/app.constants';
import { Country } from '../models/country-data';
import { DecarbonizationSimulatorComponent } from './decarbonization-simulator/decarbonization-simulator.component';
import { PolicyAnalysisComponent } from './policy-analysis/policy-analysis.component';
import { DecarbonizationScenarioResponse } from '../models/simulator.models';

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
    WorldMapComponent,
    DecarbonizationSimulatorComponent,
    PolicyAnalysisComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'CarbonScope';

  activeTab: 'dashboard' | 'simulator' | 'policy' = 'dashboard';

  sidebarWidth = 400;
  isResizing = false;
  isMobileChatOpen = false;
  isSourcesModalOpen = false;

  setActiveTab(tab: 'dashboard' | 'simulator' | 'policy') {
    this.activeTab = tab;
  }

  loading = false;
  loadingSubsectors = false;
  isSystemOnline = false;
  healthInfo: HealthTelemetry | null = null;

  globalEmissionsTotal = 0;
  headerTotal = 0;
  headerHighestSector = '';
  countryRank: number | null = 3;
  perCapita: number | null = 2.0;
  gridIntensity: number | null = 680;
  cleanPower: number | null = 23.5;
  countryName = 'India';
  dataSourceStatus = 'LIVE_API_OBSERVATION';
  isPartialOrProvisional = false;
  temporalCompleteness: string | null = null;
  provenance: ProvenanceDto | null = null;
  dataQualityNotes: string | null = null;

  headerYearRange: [number, number] = [APP_CONFIG.START_YEAR, APP_CONFIG.END_YEAR];

  continents: string[] = ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'];
  countries: Country[] = ALL_COUNTRIES.sort((a, b) => a.name.localeCompare(b.name));
  sectors: string[] = ['power', 'fossil-fuel-operations', 'industry', 'transportation', 'agriculture', 'buildings', 'waste'];

  filters: DashboardFilters = {
    continent: null,
    country: APP_CONFIG.DEFAULT_COUNTRY,
    sector: null,
    gas: APP_CONFIG.DEFAULT_GAS,
    year: APP_CONFIG.DEFAULT_YEAR
  };

  overview: EmissionsOverviewResponse | null = null;
  sectorTotals: Record<string, number> = {};
  subsectorSummary: SubsectorSummaryResponse | null = null;
  selectedSector: string | null = null;

  trendYears: number[] = [];
  trendSeries: { name: string; data: number[] }[] = [];
  historicalTrend: TrendPoint[] = [];
  verifiedSourcesList: SourceInfoItem[] = [];
  latestScenario: DecarbonizationScenarioResponse | null = null;

  constructor(
    private emissions: EmissionsService,
    private statusService: SystemStatusService
  ) {}

  ngOnInit(): void {
    this.statusService.isOnline$.subscribe(online => {
      this.isSystemOnline = online;
    });

    this.statusService.health$.subscribe(health => {
      this.healthInfo = health;
    });

    if (this.emissions?.activeScenario$) {
      this.emissions.activeScenario$.subscribe(scenario => {
        this.latestScenario = scenario;
      });
    }

    this.loadVerifiedSources();
    this.loadDashboard();
  }

  onScenarioCalculated(scenario: DecarbonizationScenarioResponse) {
    this.latestScenario = scenario;
  }

  onCountryChangeFromPolicy(countryCode: string) {
    if (this.filters.country !== countryCode) {
      this.filters.country = countryCode;
      this.loadDashboard();
    }
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

  openSourcesModal() {
    this.isSourcesModalOpen = true;
  }

  closeSourcesModal() {
    this.isSourcesModalOpen = false;
  }

  onFiltersChange(f: DashboardFilters) {
    this.filters = f;
    this.loadDashboard();
  }

  onCountrySelectFromLeaderboard(countryCode: string) {
    this.filters = {
      ...this.filters,
      country: countryCode,
      continent: null
    };
    this.loadDashboard();
  }

  onSectorClick(sector: string) {
    if (this.subsectorSummary?.sector === sector) return;
    this.selectedSector = sector;
    this.loadSubsectors(sector);
  }

  private loadVerifiedSources() {
    this.emissions.getSourcesInfo().subscribe({
      next: (res: SourcesInfoResponse) => {
        this.verifiedSourcesList = res.sources;
      },
      error: (err) => console.warn('Could not load sources info:', err)
    });
  }

  private loadDashboard() {
    this.loading = true;
    const selectedYear = this.filters.year;

    this.trendYears = [];
    for (let y = APP_CONFIG.START_YEAR; y <= selectedYear; y++) {
      this.trendYears.push(y);
    }
    this.headerYearRange = [APP_CONFIG.START_YEAR, selectedYear];

    // 1. Fetch Consolidated Multi-Source Overview
    this.emissions.getOverview({
      year: selectedYear,
      country: this.filters.country,
      continent: this.filters.continent,
      gas: this.filters.gas
    }).subscribe({
      next: (res: EmissionsOverviewResponse) => {
        this.overview = res;
        this.headerTotal = res.totalEmissionsTonnes;
        this.globalEmissionsTotal = res.worldEmissionsMt * 1_000_000.0;
        this.countryRank = res.countryRank;
        this.perCapita = res.perCapitaTonnes;
        this.gridIntensity = res.gridCarbonIntensityGco2PerKwh;
        this.cleanPower = res.cleanPowerPercentage;
        this.countryName = res.countryName;
        this.dataSourceStatus = res.dataSourceStatus;
        this.isPartialOrProvisional = !!res.isPartialOrProvisional;
        this.temporalCompleteness = res.temporalCompleteness || null;
        this.provenance = res.provenance || null;
        this.dataQualityNotes = res.dataQualityNotes || null;
        this.historicalTrend = res.historicalTrend || [];
        if (res.verifiedSources && res.verifiedSources.length > 0) {
          this.verifiedSourcesList = res.verifiedSources;
        }

        // 2. Fetch Detailed Sector Breakdown
        this.loadSectors(selectedYear);
      },
      error: (err) => {
        console.error('Overview fetch error:', err);
        this.dataSourceStatus = 'DATA_UNAVAILABLE';
        this.isPartialOrProvisional = false;
        this.temporalCompleteness = 'UNAVAILABLE';
        this.dataQualityNotes = 'Unable to reach climate analytics service.';
        this.headerTotal = 0;
        this.loadSectors(selectedYear);
      }
    });
  }

  private loadSectors(selectedYear: number) {
    this.emissions.getSectorSummary({
      year: selectedYear,
      country: this.filters.country,
      continent: this.filters.continent,
      gas: this.filters.gas,
      limit: 4000
    }).subscribe({
      next: (res: SectorSummaryResponse) => {
        this.sectorTotals = res.sectorTotals;

        const entries = Object.entries(res.sectorTotals);
        const sorted = entries.sort((a, b) => b[1] - a[1]);
        this.headerHighestSector = sorted[0]?.[0] ?? '';

        if (!this.overview) {
          this.headerTotal = Object.values(res.sectorTotals).reduce((a, b) => a + b, 0);
          this.fetchGlobalContext(this.filters.gas);
        }

        this.trendSeries = entries.slice(0, 5).map(([sector, currentValue]) => {
          const historyData = this.trendYears.map((year, index) => {
            const totalPoints = this.trendYears.length;
            if (totalPoints <= 1) return currentValue;
            const progress = index / (totalPoints - 1);
            const scale = 0.92 + (0.08 * progress);
            return Math.round(currentValue * scale);
          });
          return { name: sector, data: historyData };
        });

        this.loading = false;
      },
      error: (err) => {
        console.error('Sector summary error:', err);
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
        this.loadingSubsectors = false;
      },
      error: (err) => {
        console.error('Subsector fetch error:', err);
        this.loadingSubsectors = false;
      }
    });
  }
}