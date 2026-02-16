'use client';

import * as React from 'react';
import styles from './account.module.css';
import { rolesService } from '@/services/roles.service';
import { usersService } from '@/services/users.service';
import type { Role, User } from '@/types/api';

import { useTranslations } from 'next-intl';

export function AccountDetailsForm(): React.JSX.Element {
  const t = useTranslations('AccountDetailsForm');
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesData, userData] = await Promise.all([
          rolesService.getAll(),
          usersService.getCurrentUser()
        ]);
        setRoles(rolesData);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className={styles.cardHeader}><p>{t('loading')}</p></div>;
  }

  // Split name for the form
  const nameParts = user?.name.split(' ') || ['', ''];
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{t('title')}</h3>
          <p className={styles.cardSubheader}>{t('subheader')}</p>
        </div>
        <div className={styles.divider} />
        <div className={styles.cardContent}>
          <div className={styles.detailsGrid}>
            <div className={styles.formControl}>
              <label htmlFor="firstName" className={styles.label}>{t('firstName')}</label>
              <input defaultValue={firstName} id="firstName" name="firstName" className={styles.input} />
            </div>
            <div className={styles.formControl}>
              <label htmlFor="lastName" className={styles.label}>{t('lastName')}</label>
              <input defaultValue={lastName} id="lastName" name="lastName" className={styles.input} />
            </div>
            <div className={styles.formControl}>
              <label htmlFor="email" className={styles.label}>{t('email')}</label>
              <input defaultValue={user?.email || ''} id="email" name="email" className={styles.input} />
            </div>
            <div className={styles.formControl}>
              <label htmlFor="phone" className={styles.label}>{t('phone')}</label>
              <input id="phone" name="phone" type="tel" className={styles.input} defaultValue={user?.phone || ''} />
            </div>
            <div className={styles.formControl}>
              <label htmlFor="role" className={styles.label}>{t('role')}</label>
              <select defaultValue={user?.role || ''} id="role" name="role" className={styles.select}>
                {roles.length === 0 ? (
                  <option value="">{t('loadingRoles')}</option>
                ) : (
                  <>
                    <option value="">{t('selectRole')}</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.slug}>
                        {role.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.cardActions}>
          <button type="submit" className={styles.button}>{t('save')}</button>
        </div>
      </div>
    </form>
  );
}
