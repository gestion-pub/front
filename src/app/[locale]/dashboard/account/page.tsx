import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { AccountDetailsForm } from '@/components/dashboard/account/account-details-form';
import { AccountInfo } from '@/components/dashboard/account/account-info';
import { UpdatePasswordForm } from '@/components/dashboard/settings/update-password-form';
import styles from '@/components/dashboard/account/account.module.css';

export const metadata = { title: `Account | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: 0, color: 'var(--color-storm-grey-900)' }}>Account</h1>
      </div>
      <div className={styles.grid}>
        <div>
          <AccountInfo />
        </div>
        <div>
          <AccountDetailsForm />
          <div style={{ marginTop: '24px' }}>
            <UpdatePasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
