'use client';

import * as React from 'react';
import styles from './settings.module.css';

export function Notifications(): React.JSX.Element {
  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Notifications</h3>
          <p className={styles.cardSubheader}>Manage the notifications</p>
        </div>
        <div className={styles.divider} />
        <div className={styles.cardContent}>
          <div className={styles.grid}>
            <div className={styles.stack}>
              <h4 className={styles.sectionTitle}>Email</h4>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" defaultChecked className={styles.checkbox} />
                  Product updates
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" className={styles.checkbox} />
                  Security updates
                </label>
              </div>
            </div>
            <div className={styles.stack}>
              <h4 className={styles.sectionTitle}>Phone</h4>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" defaultChecked className={styles.checkbox} />
                  Email
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" className={styles.checkbox} />
                  Security updates
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.cardActions}>
          <button type="submit" className={styles.button}>Save changes</button>
        </div>
      </div>
    </form>
  );
}
