'use client';

import * as React from 'react';
import { DesktopIcon } from '@phosphor-icons/react/dist/ssr/Desktop';
import { DeviceTabletIcon } from '@phosphor-icons/react/dist/ssr/DeviceTablet';
import { PhoneIcon } from '@phosphor-icons/react/dist/ssr/Phone';
import type { ApexOptions } from 'apexcharts';

import { Chart } from '@/components/core/chart';
import styles from './chart-card.module.css';

const iconMapping = { Desktop: DesktopIcon, Tablet: DeviceTabletIcon, Phone: PhoneIcon } as Record<string, React.ComponentType<{ fontSize?: string; className?: string }>>;

export interface TrafficProps {
  chartSeries: number[];
  labels: string[];
  sx?: React.CSSProperties;
}

export function Traffic({ chartSeries, labels, sx }: TrafficProps): React.JSX.Element {
  const chartOptions = useChartOptions(labels);

  return (
    <div className={styles.card} style={sx}>
      <div className={styles.header}>
        <h4 className={styles.title}>Traffic source</h4>
      </div>
      <div className={styles.content}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Chart height={300} options={chartOptions} series={chartSeries} type="donut" width="100%" />
          <div className={styles.legend}>
            {chartSeries.map((item, index) => {
              const label = labels[index];
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const Icon = iconMapping[label] as any;

              return (
                <div key={label} className={styles.legendItem}>
                  {Icon ? <Icon fontSize="1.5rem" className={styles.legendIcon} /> : null}
                  <p className={styles.legendLabel}>{label}</p>
                  <p className={styles.legendValue}>
                    {item}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function useChartOptions(labels: string[]): ApexOptions {
  // Hardcoded colors for now
  const primary = '#6366f1';
  const success = '#10b981';
  const warning = '#f79009';

  return {
    chart: { background: 'transparent' },
    colors: [primary, success, warning],
    dataLabels: { enabled: false },
    labels,
    legend: { show: false },
    plotOptions: { pie: { expandOnClick: false } },
    states: { active: { filter: { type: 'none' } }, hover: { filter: { type: 'none' } } },
    stroke: { width: 0 },
    theme: { mode: 'light' },
    tooltip: { fillSeriesColor: false },
  };
}
