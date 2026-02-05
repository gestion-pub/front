import * as React from 'react';
import { ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';

import styles from './stats-card.module.css';

export interface TotalUsersProps {
  diff?: number;
  trend: 'up' | 'down';
  sx?: React.CSSProperties;
  value: string;
}

export function TotalUsers({ diff, trend, sx, value }: TotalUsersProps): React.JSX.Element {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendClass = trend === 'up' ? styles.trendUp : styles.trendDown;

  return (
    <div className={styles.card} style={sx}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <h6 className={styles.title}>Total Users</h6>
            <h3 className={styles.value}>{value}</h3>
          </div>
          <div className={`${styles.avatar} ${styles.avatarSuccess}`}>
            <UsersIcon fontSize="var(--icon-fontSize-lg)" />
          </div>
        </div>
        {diff ? (
          <div className={styles.footer}>
            <div className={`${styles.trend} ${trendClass}`}>
              <TrendIcon fontSize="var(--icon-fontSize-md)" />
              <p className={styles.diff}>{diff}%</p>
            </div>
            <p className={styles.caption}>Since last month</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
