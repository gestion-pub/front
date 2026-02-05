import * as React from 'react';
import { ReceiptIcon } from '@phosphor-icons/react/dist/ssr/Receipt';

import styles from './stats-card.module.css';

export interface TotalProfitProps {
  sx?: React.CSSProperties;
  value: string;
}

export function TotalProfit({ value, sx }: TotalProfitProps): React.JSX.Element {
  return (
    <div className={styles.card} style={sx}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <h6 className={styles.title}>Total Profit</h6>
            <h3 className={styles.value}>{value}</h3>
          </div>
          <div className={styles.avatar}>
            <ReceiptIcon fontSize="var(--icon-fontSize-lg)" />
          </div>
        </div>
      </div>
    </div>
  );
}
