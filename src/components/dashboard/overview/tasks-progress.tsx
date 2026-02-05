import * as React from 'react';
import { ListBulletsIcon } from '@phosphor-icons/react/dist/ssr/ListBullets';

import styles from './stats-card.module.css';

export interface TasksProgressProps {
  sx?: React.CSSProperties;
  value: number;
}

export function TasksProgress({ value, sx }: TasksProgressProps): React.JSX.Element {
  return (
    <div className={styles.card} style={sx}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <h6 className={styles.title}>Task Progress</h6>
            <h3 className={styles.value}>{value}%</h3>
          </div>
          <div className={`${styles.avatar} ${styles.avatarWarning}`}>
            <ListBulletsIcon fontSize="var(--icon-fontSize-lg)" />
          </div>
        </div>
        <div>
          <div className={styles.progressContainer}>
            <div
              className={`${styles.progressBar} ${styles.progressBarWarning}`}
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
