'use client';

import * as React from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import { UserIcon } from '@phosphor-icons/react/dist/ssr/User';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';
import { useUser } from '@/hooks/use-user';

import styles from './user-popover.module.css';

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export function UserPopover({ anchorEl: _anchorEl, onClose, open }: UserPopoverProps): React.JSX.Element {
  const { checkSession, user } = useUser();
  const t = useTranslations('Navigation');

  const router = useRouter();

  const handleSignOut = React.useCallback(async (): Promise<void> => {
    try {
      const { error } = await authClient.signOut();

      if (error) {
        logger.error('Sign out error', error);
        return;
      }

      // Refresh the auth state
      await checkSession?.();

      // UserProvider, for this case, will not refresh the router and we need to do it manually
      router.refresh();
      // After refresh, AuthGuard will handle the redirect
    } catch (error) {
      logger.error('Sign out error', error);
    }
  }, [checkSession, router]);

  if (!open) {
    return <></>;
  }

  return (
    <div className={styles.popover}>
      <div className={styles.header}>
        <p className={styles.name}>{user?.name ?? 'User Name'}</p>
        <p className={styles.email}>
          {user?.email ?? 'user@example.com'}
        </p>
      </div>
      <hr className={styles.divider} />
      <ul className={styles.list}>
        <li className={styles.item}>
          <Link href={paths.dashboard.settings} className={styles.link} onClick={onClose}>
            <span className={styles.icon}>
              <GearSixIcon fontSize="1.25rem" />
            </span>
            {t('settings')}
          </Link>
        </li>
        <li className={styles.item}>
          <Link href={paths.dashboard.account} className={styles.link} onClick={onClose}>
            <span className={styles.icon}>
              <UserIcon fontSize="1.25rem" />
            </span>
            {t('account')}
          </Link>
        </li>
        <li className={styles.item}>
          <button className={styles.link} onClick={handleSignOut}>
            <span className={styles.icon}>
              <SignOutIcon fontSize="1.25rem" />
            </span>
            {t('logout')}
          </button>
        </li>
      </ul>
    </div>
  );
}
