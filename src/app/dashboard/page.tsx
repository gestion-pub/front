import * as React from 'react';
import type { Metadata } from 'next';
import dayjs from 'dayjs';

import { config } from '@/config';
import { Budget } from '@/components/dashboard/overview/budget';
import { LatestOrders } from '@/components/dashboard/overview/latest-orders';
import { LatestCampagnes } from '@/components/dashboard/overview/latest-campagnes';
import { Sales } from '@/components/dashboard/overview/sales';
import { TasksProgress } from '@/components/dashboard/overview/tasks-progress';
import { TotalUsers } from '@/components/dashboard/overview/total-users';
import { TotalProfit } from '@/components/dashboard/overview/total-profit';
import { Traffic } from '@/components/dashboard/overview/traffic';

import styles from './overview.module.css';

export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <div className={styles.grid}>
      <div className={`${styles.col_12} ${styles.col_sm_6} ${styles.col_lg_3}`}>
        <Budget diff={12} trend="up" sx={{ height: '100%' }} value="$24k" />
      </div>
      <div className={`${styles.col_12} ${styles.col_sm_6} ${styles.col_lg_3}`}>
        <TotalUsers diff={16} trend="down" sx={{ height: '100%' }} value="1.6k" />
      </div>
      <div className={`${styles.col_12} ${styles.col_sm_6} ${styles.col_lg_3}`}>
        <TasksProgress sx={{ height: '100%' }} value={75.5} />
      </div>
      <div className={`${styles.col_12} ${styles.col_sm_6} ${styles.col_lg_3}`}>
        <TotalProfit sx={{ height: '100%' }} value="$15k" />
      </div>
      <div className={`${styles.col_12} ${styles.col_lg_8}`}>
        <Sales
          chartSeries={[
            { name: 'This year', data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20] },
            { name: 'Last year', data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13] },
          ]}
          sx={{ height: '100%' }}
        />
      </div>
      <div className={`${styles.col_12} ${styles.col_md_6} ${styles.col_lg_4}`}>
        <Traffic chartSeries={[63, 15, 22]} labels={['Desktop', 'Tablet', 'Phone']} sx={{ height: '100%' }} />
      </div>
      <div className={`${styles.col_12} ${styles.col_md_6} ${styles.col_lg_4}`}>
        <LatestCampagnes
          campagnes={[
            {
              id: 'PRD-005',
              name: 'Soja & Co. Eucalyptus',
              image: '/assets/avatar.png',
              updatedAt: dayjs().subtract(18, 'minutes').subtract(5, 'hour').toDate(),
            },
            {
              id: 'PRD-004',
              name: 'Necessaire Body Lotion',
              image: '/assets/avatar.png',
              updatedAt: dayjs().subtract(41, 'minutes').subtract(3, 'hour').toDate(),
            },
            {
              id: 'PRD-003',
              name: 'Ritual of Sakura',
              image: '/assets/avatar.png',
              updatedAt: dayjs().subtract(5, 'minutes').subtract(3, 'hour').toDate(),
            },
            {
              id: 'PRD-002',
              name: 'Lancome Rouge',
              image: '/assets/avatar.png',
              updatedAt: dayjs().subtract(23, 'minutes').subtract(2, 'hour').toDate(),
            },
            {
              id: 'PRD-001',
              name: 'Erbology Aloe Vera',
              image: '/assets/avatar.png',
              updatedAt: dayjs().subtract(10, 'minutes').toDate(),
            },
          ]}
          sx={{ height: '100%' }}
        />
      </div>
      <div className={`${styles.col_12} ${styles.col_md_12} ${styles.col_lg_8}`}>
        <LatestOrders
          orders={[
            {
              id: 'ORD-007',
              user: { name: 'Ekaterina Tankova' },
              amount: 30.5,
              status: 'pending',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-006',
              user: { name: 'Cao Yu' },
              amount: 25.1,
              status: 'delivered',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-004',
              user: { name: 'Alexa Richardson' },
              amount: 10.99,
              status: 'refunded',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-003',
              user: { name: 'Anje Keizer' },
              amount: 96.43,
              status: 'pending',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-002',
              user: { name: 'Clarke Gillebert' },
              amount: 32.54,
              status: 'delivered',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-001',
              user: { name: 'Adam Denisov' },
              amount: 16.76,
              status: 'delivered',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
          ]}
          sx={{ height: '100%' }}
        />
      </div>
    </div>
  );
}
