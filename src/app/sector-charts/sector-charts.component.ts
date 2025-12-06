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
    const values = sectors.map((s) => this.sectorTotals[s]);

    const axisColor = '#64748b'; // slate-500

    const formatLabel = (name: string) => {
      const map: Record<string, string> = {
        'fossil-fuel-operations': 'Fossil Fuels',
        'forestry-and-land-use': 'Forestry',
        'mineral-extraction': 'Mining',
        transportation: 'Transport',
        agriculture: 'Agriculture',
        manufacturing: 'Manufacturing',
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
      bottom: '20%',
      top: '15%',
      containLabel: true,
    };

    const tooltipConfig = {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc' },
      confine: true,
      className: 'chart-tooltip',
      valueFormatter: (value: number) => this.formatNumber(value) + ' t',
    };

    this.barChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { ...tooltipConfig, borderRadius: 12, borderWidth: 0 },
      grid: gridConfig,
      xAxis: {
        type: 'category',
        data: sectors,
        axisLabel: {
          color: axisColor,
          interval: 0,
          rotate: 45,
          formatter: formatLabel,
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: axisColor,
          formatter: (v: number) => this.formatNumber(v),
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
            borderRadius: [6, 6, 6, 6],
          },
          barWidth: '60%',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 6,
          },
        },
      ],
    });

    this.lineChart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        ...tooltipConfig,
        borderRadius: 12,
        borderWidth: 0,
        trigger: 'axis',
      },
      legend: {
        textStyle: { color: '#94a3b8' },
        top: 0,
        icon: 'circle',
        type: 'scroll',
      },
      grid: { ...gridConfig, top: '20%' },
      xAxis: {
        type: 'category',
        data: this.trendYears,
        axisLabel: { color: axisColor },
        axisLine: { lineStyle: { color: '#334155' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: axisColor,
          formatter: (v: number) => this.formatNumber(v),
        },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
      },
      series: this.trendSeries.map((s, index) => ({
        name: formatLabel(s.name),
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3 },
        itemStyle: {
          color: ['#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#8b5cf6'][
            index % 5
          ],
        },
        data: s.data,
      })),
    });

    this.performResize();
  }

  private formatNumber(value: number): string {
    if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B';
    if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
    if (value >= 1e3) return (value / 1e3).toFixed(0) + 'K';
    return value.toString();
  }
}
