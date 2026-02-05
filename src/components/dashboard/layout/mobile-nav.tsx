import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { Logo } from '@/components/core/logo';

import { navItems } from './config';
import { navIcons } from './nav-icons';

import styles from './mobile-nav.module.css';

export interface MobileNavProps {
  onClose?: () => void;
  open?: boolean;
  items?: NavItemConfig[];
}

export function MobileNav({ open, onClose }: MobileNavProps): React.JSX.Element {
  const pathname = usePathname();

  if (!open) {
    return <></>;
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <RouterLink href={paths.home}>
              <Logo color="light" height={32} width={122} />
            </RouterLink>
          </div>
        </div>
        <hr className={styles.divider} />
        <nav className={styles.navContainer}>
          {renderNavItems({ pathname, items: navItems })}
        </nav>
      </div>
    </div >
  );
}

function renderNavItems({ items = [], pathname }: { items?: NavItemConfig[]; pathname: string }): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    const { key, ...item } = curr;

    acc.push(<NavItem key={key} pathname={pathname} {...item} />);

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
        <RouterLink
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
        </RouterLink>
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
