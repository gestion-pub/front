import * as React from 'react';

import { AuthGuard } from '@/components/auth/auth-guard';
import { MainNav } from '@/components/dashboard/layout/main-nav';
import { SideNav } from '@/components/dashboard/layout/side-nav';

import styles from './layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <AuthGuard>
      <div className={styles.root}>
        <SideNav />
        <div className={styles.contentWrapper}>
          <MainNav />
          <main className={styles.main}>
            <div className={styles.container}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
