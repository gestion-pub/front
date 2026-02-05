'use client';

import * as React from 'react';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { PencilSimple } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';
import { usersService } from '@/services/users.service';
import type { User } from '@/types/api';
import styles from './users.module.css';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';

export default function UsersPage(): React.JSX.Element {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Modal State
  const [openModal, setOpenModal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    role: 'commercial' as 'admin' | 'commercial' | 'controleur'
  });

  /* ===== LOAD DATA ===== */
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersService.getAll();
      setUsers(data);
    } catch (error_) {
      setError('Failed to load users');
      console.error('Error loading users:', error_);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadUsers();
  }, []);

  /* ===== HANDLERS ===== */
  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'commercial' });
    setIsEditing(false);
    setCurrentUserId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setOpenModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Leave empty to indicate no change unless user types
      role: (user.role as 'admin' | 'commercial' | 'controleur') || 'commercial'
    });
    setCurrentUserId(user.id);
    setIsEditing(true);
    setOpenModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await usersService.delete(id);
      loadUsers();
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.email) {
      alert('Name and Email are required');
      return;
    }
    // Password required only for create
    if (!isEditing && !formData.password) {
      alert('Password is required for new users');
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditing && currentUserId) {
        // Update
        // Remove password from payload if empty
        const payload = { ...formData };
        if (!payload.password) delete (payload as any).password;

        await usersService.update(currentUserId, payload);
      } else {
        // Create
        await usersService.create(formData);
      }

      setOpenModal(false);
      resetForm();
      loadUsers();
    } catch (err: any) {
      console.error('Failed to save user:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save user';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ===== UI ===== */
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Users</h1>
        <button className={styles.button} onClick={handleOpenCreate}>
          <Plus size={20} />
          Ajouter Un Utilisateur
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingContainer}>
          <p>Loading users...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={loadUsers} className={styles.buttonSecondary}>
            Retry
          </button>
        </div>
      )}

      {/* Table List */}
      {!loading && !error && (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid var(--mui-palette-divider)' }}>
          <Table sx={{ minWidth: 650 }} aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Password</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    Aucun utilisateur
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                      {user.name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>******</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={user.role === 'admin' ? 'primary' : 'default'}
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenEdit(user)} sx={{ mr: 1 }}>
                          <PencilSimple size={20} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(user.id)}>
                          <Trash size={20} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Modal */}
      {openModal && (
        <div className={styles.modalOverlay} onClick={() => setOpenModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{isEditing ? 'Modifier Utilisateur' : 'Nouveau Utilisateur'}</h2>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formControl}>
                <label className={styles.label}>Nom complet</label>
                <input
                  className={styles.input}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: John Doe"
                  autoFocus
                />
              </div>
              <div className={styles.formControl}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  className={styles.input}
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ex: john@example.com"
                />
              </div>
              <div className={styles.formControl}>
                <label className={styles.label}>Mot de passe {isEditing && '(Laisser vide pour garder l\'actuel)'}</label>
                <input
                  type="password"
                  className={styles.input}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder={isEditing ? "******" : "******"}
                />
              </div>
              <div className={styles.formControl}>
                <label className={styles.label}>Rôle</label>
                <select
                  className={styles.input}
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <option value="admin">Admin</option>
                  <option value="commercial">Commercial</option>
                  <option value="controleur">Contrôleur</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.buttonSecondary}
                onClick={() => setOpenModal(false)}
              >
                Annuler
              </button>
              <button
                className={styles.button}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
