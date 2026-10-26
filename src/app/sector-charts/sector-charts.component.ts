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
    [100, 300, 500, 800].forEach((delay) => {
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

    const sectors = Object.keys(this.sectorTotals);
    const values = sectors.map((s) => this.sectorTotals[s] / 1_000_000.0); // Convert to Mt for display

    const axisColor = '#64748b';

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
        map[name] ||
        name.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      );
    };

    const gridConfig = {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true,
    };

    // 1. Sector Bar Chart
    this.barChart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc' },
        confine: true,
        formatter: (params: any) => {
          const p = params[0];
          return `<div class="font-bold text-white mb-1">${formatLabel(p.name)}</div>
                  <div class="text-sky-400 font-mono">${p.value.toFixed(2)} Mt CO₂e</div>`;
        },
      },
      grid: gridConfig,
      xAxis: {
        type: 'category',
        data: sectors,
        axisLabel: {
          color: axisColor,
          interval: 0,
          rotate: 35,
          formatter: formatLabel,
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: axisColor,
          formatter: (v: number) => v.toFixed(0) + ' Mt',
        },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
      },
      series: [
        {
          type: 'bar',
          data: values,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#6366f1' },
              { offset: 1, color: '#3b82f6' },
            ]),
            borderRadius: [6, 6, 0, 0],
          },
          barWidth: '45%',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 6,
          },
        },
      ],
    });

    // 2. Trend Line Chart (Using real multi-year historical trend)
    const trendYears = this.historicalTrend && this.historicalTrend.length > 0
      ? this.historicalTrend.map((t) => t.year)
      : this.trendYears;

    const trendValues = this.historicalTrend && this.historicalTrend.length > 0
      ? this.historicalTrend.map((t) => t.emissionsMt)
      : (this.trendSeries[0]?.data.map(v => v / 1_000_000.0) || []);

    const trendShares = this.historicalTrend && this.historicalTrend.length > 0
      ? this.historicalTrend.map((t) => t.shareOfGlobal)
      : [];

    this.lineChart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc' },
        formatter: (params: any) => {
          const idx = params[0]?.dataIndex;
          const yr = trendYears[idx];
          const val = trendValues[idx];
          const share = trendShares[idx];
          let html = `<div class="font-bold text-white mb-1">Year ${yr} Verified Benchmark</div>`;
          html += `<div class="text-sky-400 font-mono">Emissions: ${val ? val.toFixed(1) : '--'} Mt CO₂e</div>`;
          if (share) {
            html += `<div class="text-emerald-400 text-xs">Share of World: ${share.toFixed(2)}%</div>`;
          }
          return html;
        },
      },
      grid: gridConfig,
      xAxis: {
        type: 'category',
        data: trendYears,
        axisLabel: { color: axisColor },
        axisLine: { lineStyle: { color: '#334155' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: axisColor,
          formatter: (v: number) => v.toFixed(0) + ' Mt',
        },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
      },
      series: [
        {
          name: 'Annual Carbon Emissions',
          type: 'line',
          smooth: true,
          showSymbol: true,
          symbolSize: 8,
          lineStyle: { width: 3, color: '#38bdf8' },
          itemStyle: { color: '#38bdf8' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(56, 189, 248, 0.35)' },
              { offset: 1, color: 'rgba(56, 189, 248, 0.0)' },
            ]),
          },
          data: trendValues,
        },
      ],
    });

    this.performResize();
  }
}
