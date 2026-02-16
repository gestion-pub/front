'use client';

import * as React from 'react';
import styles from './account.module.css';
import { usersService } from '@/services/users.service';
import type { User } from '@/types/api';

export function AccountInfo(): React.JSX.Element {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await usersService.getCurrentUser();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return <div className={styles.cardHeader}><p>Loading...</p></div>;
  }
  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.infoStack}>
          <div>
            <img src={'/assets/avatar.png'} alt="User Avatar" className={styles.avatar} />
          </div>
          <div className={styles.infoTextStack}>
            <h5 className={styles.name}>{user?.name}</h5>
            <p className={styles.secondaryText}>
              {user?.role}
            </p>
            <p className={styles.secondaryText}>
              GMT
            </p>
          </div>
        </div>
      </div>
      <div className={styles.divider} />
      <div className={styles.cardActions}>
        <button className={styles.buttonText}>
          Upload picture
        </button>
      </div>
    </div>
  );
}
