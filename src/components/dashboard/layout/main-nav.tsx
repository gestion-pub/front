'use client';

import * as React from 'react';
import { BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';

import styles from './main-nav.module.css';

import { usePopover } from '@/hooks/use-popover';

import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const userPopover = usePopover<HTMLDivElement>();

  return (
    <React.Fragment>
      <header className={styles.root}>
        <div className={styles.container}>
          <div className={styles.section}></div>
          <div className={styles.section}>
            {/* Using img for avatar for now, replacing MUI Avatar */}
            <img
              onClick={userPopover.handleOpen}
              src="/assets/avatar.png"
              className={styles.avatar}
              alt="User"
              role="button"
              tabIndex={0}
              // @ts-expect-error - ref compatibility
              ref={userPopover.anchorRef}
            />
          </div>
        </div>
      </header>
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
