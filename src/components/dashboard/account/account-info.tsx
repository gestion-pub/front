import * as React from 'react';
import styles from './account.module.css';

const user = {
  name: 'User Name',
  avatar: '/assets/avatar.png',
  jobTitle: 'Job Title',
  role: 'Admin',
  timezone: 'GMT',
} as const;

export function AccountInfo(): React.JSX.Element {
  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.infoStack}>
          <div>
            <img src={user.avatar} alt="User Avatar" className={styles.avatar} />
          </div>
          <div className={styles.infoTextStack}>
            <h5 className={styles.name}>{user.name}</h5>
            <p className={styles.secondaryText}>
              {user.role}
            </p>
            <p className={styles.secondaryText}>
              {user.timezone}
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
