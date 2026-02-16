'use client';

import * as React from 'react';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { Pencil } from '@phosphor-icons/react/dist/ssr/Pencil';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { clientsService } from '@/services/clients.service';
import { PermissionGuard } from '@/components/core/permission-guard';
import type { Client } from '@/types/api';
import styles from './clients.module.css';

export default function ClientsPage(): React.JSX.Element {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [editingClient, setEditingClient] = React.useState<Client | null>(null);
  const [search, setSearch] = React.useState('');

  const [form, setForm] = React.useState({
    name: '',
    email: '',
    campagne_nom: '',
    adresse: '',
    telephone: '',
  });

  /* ===== LOAD DATA FROM API ===== */
  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientsService.getAll();
      setClients(data);
    } catch (error_) {
      setError('Failed to load clients');
      console.error('Error loading clients:', error_);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadClients();
  }, []);

  /* ===== HANDLERS ===== */
  const saveClient = async () => {
    if (!form.name || !form.telephone || !form.email) return;

    try {
      await (editingClient
        ? clientsService.update(editingClient.id, form)
        : clientsService.create(form));

      await loadClients();

      setForm({ name: '', email: '', campagne_nom: '', adresse: '', telephone: '' });
      setEditingClient(null);
      setOpen(false);
    } catch (error_) {
      console.error('Error saving client:', error_);
      alert('Failed to save client');
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setForm({
      name: client.name,
      email: client.email,
      campagne_nom: client.campagne_nom,
      adresse: client.adresse,
      telephone: client.telephone,
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;

    try {
      await clientsService.delete(id);
      await loadClients();
    } catch (error_) {
      console.error('Error deleting client:', error_);
      alert('Failed to delete client');
    }
  };

  const handleAddNew = () => {
    setOpen(true);
  };

  /* ===== FILTER ===== */
  const filteredClients = clients.filter((c) => {
    const searchLower = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower) ||
      (c.campagne_nom && c.campagne_nom.toLowerCase().includes(searchLower)) ||
      (c.telephone && c.telephone.toLowerCase().includes(searchLower))
    );
  });

  /* ===== UI ===== */
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Clients</h1>
        <PermissionGuard permission="create_client">
          <button className={styles.button} onClick={handleAddNew}>
            <Plus size={20} />
            Add Client
          </button>
        </PermissionGuard>
      </div>

      {/* Search */}
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <MagnifyingGlass className={styles.searchIcon} size={20} />
          <input
            className={styles.searchInput}
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingContainer}>
          <p>Loading clients...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={loadClients} className={styles.buttonSecondary}>
            Retry
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <div className={styles.grid}>
          {filteredClients.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px', color: '#666' }}>
              Aucun client trouvé
            </div>
          )}

          {filteredClients.map((client) => (
            <div key={client.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>{client.name}</h3>
                  <span className={styles.cardSubtitle}>{client.email}</span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Téléphone</span>
                  <span className={styles.cardValue}>{client.telephone}</span>
                </div>
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Campagne</span>
                  <span className={styles.cardValue}>{client.campagne_nom || 'N/A'}</span>
                </div>
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Adresse</span>
                  <span className={styles.cardValue}>{client.adresse || '-'}</span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.actions}>
                  <PermissionGuard permission="update_client">
                    <button className={styles.iconButton} onClick={() => handleEdit(client)} title="Modifier">
                      <Pencil size={20} />
                    </button>
                  </PermissionGuard>
                  <PermissionGuard permission="delete_client">
                    <button
                      className={`${styles.iconButton} ${styles.iconButtonError}`}
                      onClick={() => handleDelete(client.id)}
                      title="Supprimer"
                    >
                      <Trash size={20} />
                    </button>
                  </PermissionGuard>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      {open ? (
        <div className={styles.modalOverlay} onClick={() => setOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingClient ? 'Edit Client' : 'Add Client'}
              </h2>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formControl}>
                <label className={styles.label}>Nom</label>
                <input
                  className={styles.input}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div className={styles.formControl}>
                <label className={styles.label}>Email</label>
                <input
                  className={styles.input}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className={styles.formControl}>
                <label className={styles.label}>Campagne</label>
                <input
                  className={styles.input}
                  value={form.campagne_nom}
                  onChange={(e) => setForm({ ...form, campagne_nom: e.target.value })}
                />
              </div>
              <div className={styles.formControl}>
                <label className={styles.label}>Adresse</label>
                <input
                  className={styles.input}
                  value={form.adresse}
                  onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                />
              </div>
              <div className={styles.formControl}>
                <label className={styles.label}>Téléphone</label>
                <input
                  className={styles.input}
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.buttonSecondary} onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className={styles.button} onClick={saveClient}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
