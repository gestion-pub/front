'use client';

import * as React from 'react';
import { Link } from '@/i18n/routing';
import { usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { Logo } from '@/components/core/logo';

import { navItems } from './config';
import { navIcons } from './nav-icons';

import styles from './side-nav.module.css';
import { useUser } from '@/hooks/use-user';

export function SideNav(): React.JSX.Element {
  const pathname = usePathname();
  const { user } = useUser();
  const t = useTranslations('Navigation');

  return (
    <aside className={styles.root}>
      <div className={styles.header}>
        <div className={styles.logoWrapper}>
          <Link href={paths.home}>
            <Logo color="light" height={32} width={122} />
          </Link>
        </div>
      </div>
      <hr className={styles.divider} />
      <nav className={styles.navContainer}>
        {renderNavItems({ pathname, items: navItems, userPermissions: user?.permissions ?? [], t })}
      </nav>
    </aside >
  );
}

function renderNavItems({ items = [], pathname, userPermissions, t }: { items?: NavItemConfig[]; pathname: string, userPermissions: string[], t: any }): React.JSX.Element {
  const filteredItems = items.filter((item) => {
    if (!item.permission) return true;
    return userPermissions.includes(item.permission);
  });

  const children = filteredItems.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    const { key, title, ...item } = curr;

    acc.push(<NavItem key={key} pathname={pathname} title={t(key)} {...item} />);

    return acc;
  }, []);

  return (
    <ul className={styles.navList}>
      {children}
    </ul>
  );
}

interface NavItemProps extends Omit<NavItemConfig, 'items'> {
  pathname: string;
}

function NavItem({ disabled, external, href, icon, matcher, pathname, title }: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;

  const className = `${styles.navLink} ${active ? styles.navLinkActive : ''} ${disabled ? styles.navLinkDisabled : ''}`;

  return (
    <li className={styles.navItem}>
      {href ? (
        <Link
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer' : undefined}
          className={className}
        >
          <div className={styles.navIcon}>
            {Icon ? (
              <Icon
                fill={active ? 'var(--color-white)' : 'var(--color-storm-grey-400)'}
                fontSize="1.5rem"
                weight={active ? 'fill' : undefined}
              />
            ) : null}
          </div>
          <span className={styles.navLabel}>
            {title}
          </span>
        </Link>
      ) : (
        <div role="button" className={className}>
          <div className={styles.navIcon}>
            {Icon ? (
              <Icon
                fill={active ? 'var(--color-white)' : 'var(--color-storm-grey-400)'}
                fontSize="1.5rem"
                weight={active ? 'fill' : undefined}
              />
            ) : null}
          </div>
          <span className={styles.navLabel}>
            {title}
          </span>
        </div>
      )}
    </li>
  );
}
