import React from 'react';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { DotsThreeVerticalIcon } from '@phosphor-icons/react/dist/ssr/DotsThreeVertical';
import dayjs from 'dayjs';

import cardStyles from './chart-card.module.css';
import styles from './latest-campagnes.module.css';

export interface Campagne {
  id: string;
  image: string;
  name: string;
  updatedAt: Date;
}

export interface LatestCampagnesProps {
  campagnes?: Campagne[];
  sx?: React.CSSProperties; // Changed to CSSProperties
}

export function LatestCampagnes({ campagnes = [], sx }: LatestCampagnesProps): React.JSX.Element {
  return (
    <div className={cardStyles.card} style={sx}>
      <div className={cardStyles.header}>
        <h4 className={cardStyles.title}>Latest campagnes</h4>
      </div>
      <hr className={cardStyles.divider} />
      <ul className={styles.list}>
        {campagnes.map((campagne, index) => (
          <li key={campagne.id} className={`${styles.listItem} ${index < campagnes.length - 1 ? styles.listItemDivider : ''}`}>
            <div className={styles.listItemAvatar}>
              {campagne.image ? (
                <img src={campagne.image} className={styles.avatarImg} alt={campagne.name} />
              ) : (
                <div className={styles.avatarPlaceholder} />
              )}
            </div>
            <div className={styles.listItemText}>
              <p className={styles.primaryText}>{campagne.name}</p>
              <p className={styles.secondaryText}>Updated {dayjs(campagne.updatedAt).format('MMM D, YYYY')}</p>
            </div>
            <button className={styles.iconButton}>
              <DotsThreeVerticalIcon weight="bold" fontSize="1.5rem" />
            </button>
          </li>
        ))}
      </ul>
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
