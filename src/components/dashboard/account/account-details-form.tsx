'use client';

import * as React from 'react';
import styles from './account.module.css';

const roles = [
  { value: '', label: 'Select a role' },
  { value: 'admin', label: 'Admin' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'controleur', label: 'Contrôleur' },
] as const;

export function AccountDetailsForm(): React.JSX.Element {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Profile</h3>
          <p className={styles.cardSubheader}>The information can be edited</p>
        </div>
        <div className={styles.divider} />
        <div className={styles.cardContent}>
          <div className={styles.detailsGrid}>
            <div className={styles.formControl}>
              <label htmlFor="firstName" className={styles.label}>First name</label>
              <input defaultValue="" id="firstName" name="firstName" className={styles.input} />
            </div>
            <div className={styles.formControl}>
              <label htmlFor="lastName" className={styles.label}>Last name</label>
              <input defaultValue="" id="lastName" name="lastName" className={styles.input} />
            </div>
            <div className={styles.formControl}>
              <label htmlFor="email" className={styles.label}>Email address</label>
              <input defaultValue="" id="email" name="email" className={styles.input} />
            </div>
            <div className={styles.formControl}>
              <label htmlFor="phone" className={styles.label}>Phone number</label>
              <input id="phone" name="phone" type="tel" className={styles.input} />
            </div>
            <div className={styles.formControl}>
              <label htmlFor="role" className={styles.label}>Role</label>
              <select defaultValue="" id="role" name="role" className={styles.select}>
                {roles.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.cardActions}>
          <button type="submit" className={styles.button}>Save details</button>
        </div>
      </div>
    </form>
  );
}
