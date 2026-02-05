import * as React from 'react';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import styles from './plannings-filters.module.css';

export function CompaniesFilters(): React.JSX.Element {
  return (
    <div className={styles.card}>
      <div className={styles.searchContainer}>
        <div className={styles.icon}>
          <MagnifyingGlassIcon />
        </div>
        <input
          defaultValue=""
          placeholder="Search planning"
          className={styles.input}
        />
      </div>
    </div>
  );
}
