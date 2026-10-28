import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as echarts from 'echarts';
import { Subscription } from 'rxjs';
import { TrendPoint } from '../../models/emissions.models';
import { DecarbonizationScenarioResponse } from '../../models/simulator.models';
import { EmissionsService } from '../emissions.service';

@Component({
  selector: 'app-sector-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sector-charts.component.html',
  styleUrls: ['./sector-charts.component.scss'],
})
export class SectorChartsComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  @Input() sectorTotals: Record<string, number> = {};
  @Input() trendSeries: { name: string; data: number[] }[] = [];
  @Input() trendYears: number[] = [];
  @Input() selectedSector: string | null = null;
  @Input() historicalTrend: TrendPoint[] = [];
  @Input() scenarioResult: DecarbonizationScenarioResponse | null = null;

  showScenarioOverlay = true;
  private internalScenario: DecarbonizationScenarioResponse | null = null;
  private scenarioSub?: Subscription;

  get currentScenario(): DecarbonizationScenarioResponse | null {
    return this.scenarioResult || this.internalScenario;
  }

  get scenarioMedianText(): string {
    const s = this.currentScenario;
    if (!s) return '';
    const interval = s.impact?.sensitivityInterval;
    const med = interval ? interval.medianAvoidedEmissionsMt : s.impact.netAvoidedEmissionsMt;
    const unit = interval?.emissionsUnit || (s.accountingBoundary === 'OPERATIONAL_SCOPE_1' ? 'Mt CO₂/yr' : 'Mt CO₂e/yr');
    return `-${med.toFixed(1)} ${unit}`;
  }

  get scenarioRangeText(): string {
    const s = this.currentScenario;
    if (!s) return '';
    const interval = s.impact?.sensitivityInterval;
    if (!interval) return '';
    return `-${interval.minAvoidedEmissionsMt.toFixed(1)} to -${interval.maxAvoidedEmissionsMt.toFixed(1)} ${interval.emissionsUnit}`;
  }

  get trendRangeText(): string {
    const valid = this.historicalTrend?.filter(t => t.available !== false && t.emissionsMt > 0);
    if (valid && valid.length > 0) {
      return `${valid[0].year} - ${valid[valid.length - 1].year} (Satellite Observations)`;
    }
    if (this.trendYears && this.trendYears.length > 0) {
      return `${this.trendYears[0]} - ${this.trendYears[this.trendYears.length - 1]}`;
    }
    return '2015 - 2026';
  }

  private barChart?: echarts.ECharts;
  private lineChart?: echarts.ECharts;
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    private el: ElementRef,
    private zone: NgZone,
    private emissionsService: EmissionsService
  ) {}

  ngOnInit() {
    this.scenarioSub = this.emissionsService.activeScenario$.subscribe((scenario) => {
      this.internalScenario = scenario;
      if (this.lineChart) {
        this.updateCharts();
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.initCharts(), 0);

    this.resizeObserver = new ResizeObserver(() => {
      this.triggerResizeSequence();
    });

    this.resizeObserver.observe(this.el.nativeElement);
    window.addEventListener('resize', this.onWindowResize);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.barChart || this.lineChart) {
      this.updateCharts();
    }
  }

  ngOnDestroy() {
    this.scenarioSub?.unsubscribe();
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.onWindowResize);
    this.barChart?.dispose();
    this.lineChart?.dispose();
  }

  toggleScenarioOverlay() {
    this.showScenarioOverlay = !this.showScenarioOverlay;
    this.updateCharts();
  }

  private onWindowResize = () => {
    this.triggerResizeSequence();
  };

  private triggerResizeSequence() {
    this.performResize();
    [80, 200, 400].forEach((delay) => {
      setTimeout(() => this.performResize(), delay);
    });
  }

  private performResize() {
    this.zone.runOutsideAngular(() => {
      this.barChart?.resize({ width: 'auto', height: 'auto' });
      this.lineChart?.resize({ width: 'auto', height: 'auto' });
    });
  }

  private initCharts() {
    const barEl = this.el.nativeElement.querySelector('#sectorBarChart');
    const lineEl = this.el.nativeElement.querySelector('#trendLineChart');

    if (barEl) this.barChart = echarts.init(barEl);
    if (lineEl) this.lineChart = echarts.init(lineEl);

    this.updateCharts();
  }

  private updateCharts() {
    if (!this.barChart || !this.lineChart) return;

    const isMobile = window.innerWidth < 640;

    // Standardize and select top 6 macro sectors to prevent X-axis collisions
    const formatLabel = (name: string) => {
      const map: Record<string, string> = {
        'fossil-fuel-operations': 'Fossil Fuels',
        'forestry-and-land-use': 'Forestry',
        'mineral-extraction': 'Mining',
        transportation: 'Transport',
        agriculture: 'Agriculture',
        industry: 'Industry',
        power: 'Power',
        waste: 'Waste',
        buildings: 'Buildings',
      };
      return (
        map[name.toLowerCase()] ||
        name.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      );
    };

    // Filter, sort, and limit to top 6 sectors
    const entries = Object.entries(this.sectorTotals)
      .filter(([_, val]) => val > 0)
      .sort((a, b) => b[1] - a[1]);

    const topEntries = entries.slice(0, 6);
    const sectors = topEntries.map(([s]) => s);
    const values = topEntries.map(([_, val]) => Math.round((val / 1_000_000.0) * 10) / 10);

    const axisColor = '#94a3b8'; // slate-400

    const gridConfig = {
      left: '3%',
      right: this.currentScenario && this.showScenarioOverlay ? '6%' : '3%',
      bottom: isMobile ? '20%' : '14%',
      top: '12%',
      containLabel: true,
    };

    // 1. Sector Bar Chart
    this.barChart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(11, 17, 33, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        padding: [10, 14],
        textStyle: { color: '#f8fafc', fontSize: 12 },
        confine: true,
        formatter: (params: any) => {
          const p = params[0];
          return `<div class="font-bold text-white mb-1">${formatLabel(p.name)}</div>
                  <div class="text-sky-400 font-mono font-bold">${p.value} Mt CO₂e</div>`;
        },
      },
      grid: gridConfig,
      xAxis: {
        type: 'category',
        data: sectors,
        axisLabel: {
          color: axisColor,
          interval: 0,
          rotate: isMobile ? 22 : 0,
          fontSize: isMobile ? 10 : 11,
          fontWeight: 500,
          formatter: formatLabel,
        },
        axisLine: { lineStyle: { color: '#334155' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: axisColor,
          fontSize: 10,
          formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v + ' Mt',
        },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
      },
      series: [
        {
          type: 'bar',
          data: values,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#38bdf8' },
              { offset: 1, color: '#4f46e5' },
            ]),
            borderRadius: [6, 6, 0, 0],
          },
          barWidth: isMobile ? '55%' : '42%',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 6,
          },
        },
      ],
    });

    // 2. Trend Line Chart - Filtered strictly to verified empirical observations
    const availableTrend = (this.historicalTrend && this.historicalTrend.length > 0)
      ? this.historicalTrend.filter(t => t.available !== false && t.emissionsMt > 0)
      : [];

    const histYears = availableTrend.length > 0
      ? availableTrend.map((t) => t.year)
      : this.trendYears;

    const histValues = availableTrend.length > 0
      ? availableTrend.map((t) => Math.round(t.emissionsMt * 10) / 10)
      : (this.trendSeries[0]?.data.map(v => Math.round((v / 1_000_000.0) * 10) / 10) || []);

    const histShares = availableTrend.length > 0
      ? availableTrend.map((t) => t.shareOfGlobal)
      : [];

    const scenario = this.showScenarioOverlay ? this.currentScenario : null;
    const hasScenario = !!scenario && scenario.impact != null;

    // X-Axis categories
    const xAxisCategories = hasScenario && histYears.length > 0
      ? [...histYears.map(String), 'Illustrative Scenario (Single-Horizon Endpoint)']
      : histYears.map(String);

    // Historical data: null at Scenario Endpoint (never subtracting avoided emissions from national inventory!)
    const histData = hasScenario
      ? [...histValues, null]
      : histValues;

    // Build series list
    const seriesList: any[] = [
      {
        name: 'Historical Emissions',
        type: 'line',
        smooth: 0.35,
        showSymbol: true,
        symbolSize: 8,
        lineStyle: { width: 3, color: '#38bdf8' },
        itemStyle: { color: '#38bdf8', borderWidth: 2, borderColor: '#0f172a' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(56, 189, 248, 0.28)' },
            { offset: 1, color: 'rgba(56, 189, 248, 0.00)' },
          ]),
        },
        data: histData,
      },
    ];

    let yAxes: any[] = [
      {
        name: 'Historical (Mt CO₂e)',
        nameTextStyle: { color: axisColor, fontSize: 10 },
        type: 'value',
        scale: true,
        axisLabel: {
          color: axisColor,
          fontSize: 10,
          formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v + ' Mt',
        },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
      },
    ];

    if (hasScenario && histYears.length > 0) {
      const interval = scenario.impact?.sensitivityInterval;
      const medAvoided = interval ? interval.medianAvoidedEmissionsMt : scenario.impact.netAvoidedEmissionsMt;
      const minAvoided = interval ? interval.minAvoidedEmissionsMt : (medAvoided * 0.7);
      const maxAvoided = interval ? interval.maxAvoidedEmissionsMt : (medAvoided * 1.3);

      const nullPadding = Array(Math.max(0, histYears.length - 1)).fill(null);

      // 1. Lower Sensitivity Bound
      seriesList.push({
        name: 'Sensitivity Lower Bound',
        type: 'line',
        yAxisIndex: 1,
        stack: 'sensitivity-band',
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { width: 1.5, type: 'dashed', color: '#10b981' },
        itemStyle: { color: '#10b981' },
        data: [...nullPadding, 0, Math.round(minAvoided * 10) / 10],
      });

      // 2. Shaded Sensitivity Spread Area (Area between min and max)
      const spread = Math.max(0, Math.round((maxAvoided - minAvoided) * 10) / 10);
      seriesList.push({
        name: 'IPCC Sourced Sensitivity Range',
        type: 'line',
        yAxisIndex: 1,
        stack: 'sensitivity-band',
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.35)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.08)' },
          ]),
        },
        data: [...nullPadding, 0, spread],
      });

      // 3. Upper Sensitivity Bound
      seriesList.push({
        name: 'Sensitivity Upper Bound',
        type: 'line',
        yAxisIndex: 1,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { width: 1.5, type: 'dashed', color: '#34d399' },
        itemStyle: { color: '#34d399' },
        data: [...nullPadding, 0, Math.round(maxAvoided * 10) / 10],
      });

      // 4. Median Net Avoided Projection Line
      seriesList.push({
        name: 'Illustrative Scenario Abatement (Median)',
        type: 'line',
        yAxisIndex: 1,
        showSymbol: true,
        symbol: 'diamond',
        symbolSize: 10,
        lineStyle: { width: 3, type: 'dashed', color: '#10b981' },
        itemStyle: { color: '#10b981', borderWidth: 2, borderColor: '#022c22' },
        data: [...nullPadding, 0, Math.round(medAvoided * 10) / 10],
      });

      // Secondary Y-axis for Modeled Abatement
      yAxes.push({
        name: 'Modeled Abatement (Mt/yr)',
        nameTextStyle: { color: '#10b981', fontSize: 10, fontWeight: 'bold' },
        type: 'value',
        position: 'right',
        min: 0,
        axisLabel: {
          color: '#10b981',
          fontSize: 10,
          formatter: (v: number) => v.toFixed(0) + ' Mt',
        },
        splitLine: { show: false },
      });
    }

    this.lineChart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(11, 17, 33, 0.96)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        padding: [10, 14],
        textStyle: { color: '#f8fafc', fontSize: 12 },
        confine: true,
        formatter: (params: any) => {
          const idx = params[0]?.dataIndex;
          if (idx < histYears.length) {
            const yr = histYears[idx];
            const val = histValues[idx];
            const share = histShares[idx];
            const pt = availableTrend[idx];
            const prov = pt?.provenance === 'LIVE_API_OBSERVATION'
              ? 'Satellite Observation (Climate TRACE)'
              : (pt?.provenance === 'STATIC_REFERENCE_BENCHMARK' ? 'Reference Benchmark' : 'Empirical Observation');

            let html = `<div class="font-bold text-white mb-0.5">Year ${yr}</div>`;
            html += `<div class="text-[10px] text-slate-400 mb-1.5 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>${prov}</div>`;
            html += `<div class="text-sky-400 font-mono font-bold">Emissions: ${val ? val.toFixed(1) : '--'} Mt CO₂e</div>`;
            if (share != null && share > 0) {
              html += `<div class="text-emerald-400 text-xs mt-1">Global Share: ${share.toFixed(2)}% of World</div>`;
            }
            return html;
          }

          // Scenario Endpoint
          if (hasScenario) {
            const interval = scenario.impact?.sensitivityInterval;
            const medAvoided = interval ? interval.medianAvoidedEmissionsMt : scenario.impact.netAvoidedEmissionsMt;
            const minAvoided = interval ? interval.minAvoidedEmissionsMt : (medAvoided * 0.7);
            const maxAvoided = interval ? interval.maxAvoidedEmissionsMt : (medAvoided * 1.3);
            const unit = interval?.emissionsUnit || (scenario.accountingBoundary === 'OPERATIONAL_SCOPE_1' ? 'Mt CO₂/yr' : 'Mt CO₂e/yr');

            let html = `<div class="font-bold text-white mb-1 flex items-center gap-1.5">
                          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          Illustrative Scenario (Single-Horizon Endpoint)
                        </div>`;
            html += `<div class="text-xs text-amber-300 font-semibold mb-1">${scenario.interventionName}</div>`;
            html += `<div class="text-emerald-400 font-mono font-black text-sm">Median Avoided: -${medAvoided.toFixed(2)} ${unit}</div>`;
            html += `<div class="text-slate-300 font-mono text-[11px] mt-0.5">Sensitivity Range: -${minAvoided.toFixed(2)} to -${maxAvoided.toFixed(2)} ${unit}</div>`;
            html += `<div class="border-t border-white/10 mt-1.5 pt-1 text-[10px] text-slate-400 leading-tight">
                      <strong>Boundary:</strong> ${scenario.accountingBoundary === 'OPERATIONAL_SCOPE_1' ? 'Direct Stack Combustion (Scope 1)' : 'Global Life-Cycle (Scope 1-3 LCA)'}
                    </div>`;
            html += `<div class="text-[9px] text-slate-400 mt-0.5 leading-tight">
                      <strong>Sensitivity Basis:</strong> ${interval?.uncertaintyDescription || 'IPCC Sourced Factor Distribution'}
                    </div>`;
            html += `<div class="text-[9px] text-amber-300/90 mt-1 leading-tight font-medium">
                      <strong>Scientific Accounting Rule:</strong> Static single-horizon scenario modeled on secondary axis; strictly isolated from national empirical observations. Not an annual forecast.
                    </div>`;
            return html;
          }

          return '';
        },
      },
      grid: gridConfig,
      xAxis: {
        type: 'category',
        data: xAxisCategories,
        axisLabel: {
          color: axisColor,
          fontSize: isMobile ? 10 : 11,
          fontWeight: 500,
          interval: 0,
          rotate: hasScenario ? 20 : 0,
        },
        axisLine: { lineStyle: { color: '#334155' } },
        axisTick: { show: false },
      },
      yAxis: yAxes,
      series: seriesList,
    });

    this.performResize();
  }
}
