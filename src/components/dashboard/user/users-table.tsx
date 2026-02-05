'use client';

import * as React from 'react';
import { useSelection } from '@/hooks/use-selection';
import styles from './users-table.module.css';

function noop(): void {}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface UsersTableProps {
  count?: number;
  page?: number;
  rows?: User[];
  rowsPerPage?: number;
}

export function UsersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 5,
}: UsersTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => rows.map((user) => user.id), [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = selected.size > 0 && selected.size < rows.length;
  const selectedAll = rows.length > 0 && selected.size === rows.length;

  return (
    <div className={styles.card}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectedAll}
                  ref={(input) => {
                    if (input) input.indeterminate = selectedSome;
                  }}
                  onChange={(e) => (e.target.checked ? selectAll() : deselectAll())}
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isSelected = selected.has(row.id);

              return (
                <tr key={row.id} className={`${styles.tableRow} ${isSelected ? styles.selected : ''}`}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) =>
                        e.target.checked ? selectOne(row.id) : deselectOne(row.id)
                      }
                    />
                  </td>
                  <td>
                    <div className={styles.userInfo}>
                      {row.avatar ? (
                        <img src={row.avatar} alt={row.name} className={styles.avatar} />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {row.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className={styles.userName}>{row.name}</span>
                    </div>
                  </td>
                  <td>{row.email}</td>
                  <td>{row.role}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.buttonSmall}>Edit</button>
                      <button className={`${styles.buttonSmall} ${styles.buttonError}`}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className={styles.pagination}>
        <span>
          Page {page + 1} of {Math.ceil(count / rowsPerPage)}
        </span>
        {/* Placeholder pagination buttons since logic wasn't fully implemented in original */}
        <button className={styles.paginationButton} disabled={page === 0} onClick={noop}>Previous</button>
        <button className={styles.paginationButton} disabled={(page + 1) * rowsPerPage >= count} onClick={noop}>Next</button>
      </div>
    </div>
  );
}

