import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { Notifications } from '@/components/dashboard/settings/notifications';
import { UpdatePasswordForm } from '@/components/dashboard/settings/update-password-form';

export const metadata = { title: `Settings | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: 0, color: 'var(--color-storm-grey-900)' }}>Settings</h1>
      </div>
      <Notifications />
      <UpdatePasswordForm />
    </div>
  );
}
