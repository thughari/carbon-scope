import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as echarts from 'echarts';
import { TrendPoint } from '../../models/emissions.models';

@Component({
  selector: 'app-sector-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sector-charts.component.html',
  styleUrls: ['./sector-charts.component.scss'],
})
export class SectorChartsComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() sectorTotals: Record<string, number> = {};
  @Input() trendSeries: { name: string; data: number[] }[] = [];
  @Input() trendYears: number[] = [];
  @Input() selectedSector: string | null = null;
  @Input() historicalTrend: TrendPoint[] = [];

  get trendRangeText(): string {
    if (this.historicalTrend && this.historicalTrend.length > 0) {
      return `${this.historicalTrend[0].year} - ${this.historicalTrend[this.historicalTrend.length - 1].year}`;
    }
    if (this.trendYears && this.trendYears.length > 0) {
      return `${this.trendYears[0]} - ${this.trendYears[this.trendYears.length - 1]}`;
    }
    return '2015 - Present';
  }

  private barChart?: echarts.ECharts;
  private lineChart?: echarts.ECharts;
  private resizeObserver: ResizeObserver | null = null;

  constructor(private el: ElementRef, private zone: NgZone) {}

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
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.onWindowResize);
    this.barChart?.dispose();
    this.lineChart?.dispose();
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

    // Filter, sort, and limit to top 6 sectors + "Other" if needed
    const entries = Object.entries(this.sectorTotals)
      .filter(([_, val]) => val > 0)
      .sort((a, b) => b[1] - a[1]);

    const topEntries = entries.slice(0, 6);
    const sectors = topEntries.map(([s]) => s);
    const values = topEntries.map(([_, val]) => Math.round((val / 1_000_000.0) * 10) / 10);

    const axisColor = '#94a3b8'; // slate-400

    const gridConfig = {
      left: '3%',
      right: '3%',
      bottom: isMobile ? '20%' : '14%',
      top: '12%',
      containLabel: true,
    };

    // 1. Sector Bar Chart - Clean, non-colliding
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

    // 2. Trend Line Chart - Scaled Y-axis for dynamic curve
    const trendYears = this.historicalTrend && this.historicalTrend.length > 0
      ? this.historicalTrend.map((t) => t.year)
      : this.trendYears;

    const trendValues = this.historicalTrend && this.historicalTrend.length > 0
      ? this.historicalTrend.map((t) => Math.round(t.emissionsMt * 10) / 10)
      : (this.trendSeries[0]?.data.map(v => Math.round((v / 1_000_000.0) * 10) / 10) || []);

    const trendShares = this.historicalTrend && this.historicalTrend.length > 0
      ? this.historicalTrend.map((t) => t.shareOfGlobal)
      : [];

    this.lineChart.setOption({
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
          const idx = params[0]?.dataIndex;
          const yr = trendYears[idx];
          const val = trendValues[idx];
          const share = trendShares[idx];
          let html = `<div class="font-bold text-white mb-1">Year ${yr} Verified Benchmark</div>`;
          html += `<div class="text-sky-400 font-mono font-bold">Emissions: ${val ? val.toFixed(1) : '--'} Mt CO₂e</div>`;
          if (share != null && share > 0) {
            html += `<div class="text-emerald-400 text-xs mt-1">Global Share: ${share.toFixed(2)}% of World</div>`;
          }
          return html;
        },
      },
      grid: gridConfig,
      xAxis: {
        type: 'category',
        data: trendYears,
        axisLabel: { color: axisColor, fontSize: 11, fontWeight: 500 },
        axisLine: { lineStyle: { color: '#334155' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        scale: true, // Enables dynamic scaling so line is expressive!
        axisLabel: {
          color: axisColor,
          fontSize: 10,
          formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v + ' Mt',
        },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
      },
      series: [
        {
          name: 'Annual Emissions',
          type: 'line',
          smooth: 0.35,
          showSymbol: true,
          symbolSize: 8,
          lineStyle: { width: 3, color: '#38bdf8' },
          itemStyle: { color: '#38bdf8', borderWidth: 2, borderColor: '#0f172a' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(56, 189, 248, 0.30)' },
              { offset: 1, color: 'rgba(56, 189, 248, 0.00)' },
            ]),
          },
          data: trendValues,
        },
      ],
    });

    this.performResize();
  }
}
