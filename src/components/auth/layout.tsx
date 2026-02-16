import * as React from 'react';
import RouterLink from 'next/link';

import { paths } from '@/paths';
import { DynamicLogo } from '@/components/core/logo';
import styles from './auth-layout.module.css';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <div className={styles.root}>
      <div className={styles.contentSide}>
        <div className={styles.logoWrapper}>
          <RouterLink href={paths.home} style={{ display: 'inline-block', fontSize: 0 }}>
            <DynamicLogo colorDark="light" colorLight="dark" height={32} width={122} />
          </RouterLink>
        </div>
        <div className={styles.contentWrapper}>
          <div className={styles.contentContainer}>{children}</div>
        </div>
      </div>
    </div>
  );
}
