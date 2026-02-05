'use client';

import * as React from 'react';
import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import type { ApexOptions } from 'apexcharts';

import { Chart } from '@/components/core/chart';
import styles from './chart-card.module.css';

export interface SalesProps {
  chartSeries: { name: string; data: number[] }[];
  sx?: React.CSSProperties;
}

export function Sales({ chartSeries, sx }: SalesProps): React.JSX.Element {
  const chartOptions = useChartOptions();

  return (
    <div className={styles.card} style={sx}>
      <div className={styles.header}>
        <h4 className={styles.title}>Sales</h4>
        <button className={styles.actionButton}>
          <ArrowClockwiseIcon fontSize="1rem" />
          Sync
        </button>
      </div>
      <div className={styles.content}>
        <Chart height={350} options={chartOptions} series={chartSeries} type="bar" width="100%" />
      </div>
      <hr className={styles.divider} />
      <div className={styles.actions}>
        <button className={styles.actionButton}>
          Overview
          <ArrowRightIcon fontSize="1rem" />
        </button>
      </div>
    </div>
  );
}

function useChartOptions(): ApexOptions {
  // Using direct color values for now or could map to the CSS vars if config allows (ApexCharts supports css vars in some places but safer to use hex/rgb)
  // Devias Kit Pro usually uses: Primary: #6366F1 (Indigo), Text Secondary: #667085
  const primaryColor = '#6366f1';
  const dividerColor = '#EAECF0';
  const textSecondaryColor = '#667085';

  return {
    chart: { background: 'transparent', stacked: false, toolbar: { show: false } },
    colors: [primaryColor, 'rgba(99, 102, 241, 0.25)'], // Primary and faded primary
    dataLabels: { enabled: false },
    fill: { opacity: 1, type: 'solid' },
    grid: {
      borderColor: dividerColor,
      strokeDashArray: 2,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    plotOptions: { bar: { columnWidth: '40px' } },
    stroke: { colors: ['transparent'], show: true, width: 2 },
    theme: { mode: 'light' }, // hardcoded to light for this refactor unless we implement theme provider replacement
    xaxis: {
      axisBorder: { color: dividerColor, show: true },
      axisTicks: { color: dividerColor, show: true },
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: { offsetY: 5, style: { colors: textSecondaryColor } },
    },
    yaxis: {
      labels: {
        formatter: (value) => (value > 0 ? `${value}K` : `${value}`),
        offsetX: -10,
        style: { colors: textSecondaryColor },
      },
    },
  };
}
