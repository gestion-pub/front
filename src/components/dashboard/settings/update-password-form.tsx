'use client';

import * as React from 'react';
import styles from './settings.module.css';

export function UpdatePasswordForm(): React.JSX.Element {
  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Password</h3>
          <p className={styles.cardSubheader}>Update password</p>
        </div>
        <div className={styles.divider} />
        <div className={styles.cardContent}>
          <div className={`${styles.stack} ${styles.maxWidthSm}`}>
            <div className={styles.formControl}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input id="password" name="password" type="password" className={styles.input} />
            </div>
            <div className={styles.formControl}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirm password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" className={styles.input} />
            </div>
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.cardActions}>
          <button type="submit" className={styles.button}>Update</button>
        </div>
      </div>
    </form>
  );
}
