import * as React from 'react';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import dayjs from 'dayjs';

import cardStyles from './chart-card.module.css';
import styles from './latest-orders.module.css';

const statusMap = {
  pending: { label: 'Pending', className: styles.statusWarning },
  delivered: { label: 'Delivered', className: styles.statusSuccess },
  refunded: { label: 'Refunded', className: styles.statusError },
} as const;

export interface Order {
  id: string;
  user: { name: string };
  amount: number;
  status: 'pending' | 'delivered' | 'refunded';
  createdAt: Date;
}

export interface LatestOrdersProps {
  orders?: Order[];
  sx?: React.CSSProperties;
}

export function LatestOrders({ orders = [], sx }: LatestOrdersProps): React.JSX.Element {
  return (
    <div className={cardStyles.card} style={sx}>
      <div className={cardStyles.header}>
        <h4 className={cardStyles.title}>Latest orders</h4>
      </div>
      <hr className={cardStyles.divider} />
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th>Order</th>
              <th>User</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {orders.map((order) => {
              const { label, className } = statusMap[order.status] ?? { label: 'Unknown', className: styles.statusDefault };

              return (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.user.name}</td>
                  <td>{dayjs(order.createdAt).format('MMM D, YYYY')}</td>
                  <td>
                    <span className={`${styles.statusPill} ${className}`}>
                      {label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <hr className={cardStyles.divider} />
      <div className={cardStyles.actions}>
        <button className={cardStyles.actionButton}>
          View all
          <ArrowRightIcon fontSize="1rem" />
        </button>
      </div>
    </div>
  );
}
