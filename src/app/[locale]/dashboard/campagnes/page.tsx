'use client';

import * as React from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Pencil } from '@phosphor-icons/react/dist/ssr/Pencil';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { campagnesService } from '@/services/campagnes.service';
import { clientsService } from '@/services/clients.service';
import { categoriesService } from '@/services/categories.service';
import { PermissionGuard } from '@/components/core/permission-guard';
import type { Campagne, Client, Categorie } from '@/types/api';
import styles from './campagnes.module.css';

export default function CampagnePage(): React.JSX.Element {
  const [campagnes, setCampagnes] = React.useState<Campagne[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [categories, setCategories] = React.useState<Categorie[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [editingCampagne, setEditingCampagne] = React.useState<Campagne | null>(null);
  const [search, setSearch] = React.useState('');

  const [form, setForm] = React.useState({
    date_début: '',
    date_fin: '',
    type: 'classique' as 'classique' | 'hor_écran',
    ranking: 1,
    duree: 0,
    spot: '',
    spot_id: 0,
    id_client: 0,
    id_categorie: 0,
  });

  /* ===== LOAD DATA ===== */
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [campagnesData, clientsData, categoriesData] = await Promise.all([
        campagnesService.getAll(),
        clientsService.getAll(),
        categoriesService.getAll(),
      ]);
      setCampagnes(campagnesData);
      setClients(clientsData);
      setCategories(categoriesData);
    } catch (error_) {
      setError('Failed to load data');
      console.error('Error loading data:', error_);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  /* ===== HANDLERS ===== */
  const saveCampagne = async () => {
    if (!form.spot || !form.id_client || !form.id_categorie) return;

    try {
      await (editingCampagne
        ? campagnesService.update(editingCampagne.id, form)
        : campagnesService.create(form));

      await loadData();
      setForm({
        date_début: '',
        date_fin: '',
        type: 'classique',
        ranking: 1,
        duree: 0,
        spot: '',
        spot_id: 0,
        id_client: 0,
        id_categorie: 0,
      });
      setEditingCampagne(null);
      setOpen(false);
    } catch (error_) {
      console.error('Error saving campagne:', error_);
      alert('Failed to save campagne');
    }
  };

  const handleEdit = (campagne: Campagne) => {
    setEditingCampagne(campagne);
    setForm({
      date_début: campagne.date_debut,
      date_fin: campagne.date_fin,
      type: campagne.type,
      ranking: campagne.ranking,
      duree: campagne.duree || 0,
      spot: String(campagne.spot),
      spot_id: campagne.spot_id || 0,
      id_client: campagne.id_client,
      id_categorie: campagne.id_categorie,
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) return;

    try {
      await campagnesService.delete(id);
      await loadData();
    } catch (error_) {
      console.error('Error deleting campagne:', error_);
      alert('Failed to delete campagne');
    }
  };

  const handleAddNew = () => {
    setEditingCampagne(null);
    setForm({
      date_début: '',
      date_fin: '',
      type: 'classique',
      ranking: 1,
      duree: 0,
      spot: '',
      spot_id: 0,
      id_client: 0,
      id_categorie: 0,
    });
    setOpen(true);
  };

  /* ===== FILTER ===== */
  const filteredCampagnes = campagnes.filter((c) => {
    const searchLower = search.toLowerCase();
    return (
      c.client?.name.toLowerCase().includes(searchLower) ||
      String(c.spot).toLowerCase().includes(searchLower) ||
      c.type.toLowerCase().includes(searchLower)
    );
  });

  /* ===== UI ===== */
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Campagnes</h1>
        <PermissionGuard permission="create_compagne">
          <button className={styles.button} onClick={handleAddNew}>
            <Plus size={20} />
            Add Campagne
          </button>
        </PermissionGuard>
      </div>

      {/* Search */}
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <MagnifyingGlass className={styles.searchIcon} size={20} />
          <input
            className={styles.searchInput}
            placeholder="Search campagnes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingContainer}>
          <p>Loading campagnes...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={loadData} className={styles.buttonSecondary}>
            Retry
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <div className={styles.grid}>
          {filteredCampagnes.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px', color: '#666' }}>
              Aucune campagne trouvée
            </div>
          )}
          {filteredCampagnes.map((campagne) => (
            <div key={campagne.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>{campagne.spot}</h3>
                  <span className={styles.cardSubtitle}>{campagne.client?.name || 'Client inconnu'}</span>
                </div>
                <span className={campagne.ranking === 1 ? styles.badgeActive : styles.badgeInactive}>
                  {campagne.ranking === 1 ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Catégorie</span>
                  <span className={styles.cardValue}>{campagne.categorie?.nom_categorie || '-'}</span>
                </div>
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Type</span>
                  <span className={styles.cardValue}>{campagne.type}</span>
                </div>
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Durée</span>
                  <span className={styles.cardValue}>{campagne.duree ? `${campagne.duree}s` : '-'}</span>
                </div>
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Période</span>
                  <span className={styles.cardValue}>
                    {campagne.date_debut} - {campagne.date_fin}
                  </span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.actions}>
                  <PermissionGuard permission="update_compagne">
                    <button className={styles.iconButton} onClick={() => handleEdit(campagne)} title="Modifier">
                      <Pencil size={20} />
                    </button>
                  </PermissionGuard>
                  <PermissionGuard permission="delete_compagne">
                    <button
                      className={`${styles.iconButton} ${styles.iconButtonError}`}
                      onClick={() => handleDelete(campagne.id)}
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
                {editingCampagne ? 'Edit Campagne' : 'Add Campagne'}
              </h2>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formControl}>
                  <label className={styles.label}>Client</label>
                  <select
                    className={styles.select}
                    value={form.id_client}
                    onChange={(e) => setForm({ ...form, id_client: Number(e.target.value) })}
                  >
                    <option value={0}>Select client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formControl}>
                  <label className={styles.label}>Catégorie</label>
                  <select
                    className={styles.select}
                    value={form.id_categorie}
                    onChange={(e) => setForm({ ...form, id_categorie: Number(e.target.value) })}
                  >
                    <option value={0}>Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nom_categorie}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formControl}>
                  <label className={styles.label}>Spot</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Enter spot name"
                    value={form.spot}
                    onChange={(e) => setForm({ ...form, spot: e.target.value })}
                  />
                </div>

                <div className={styles.formControl}>
                  <label className={styles.label}>Spot ID</label>
                  <input
                    className={styles.input}
                    type="number"
                    value={form.spot_id}
                    onChange={(e) => setForm({ ...form, spot_id: Number(e.target.value) })}
                  />
                </div>

                <div className={styles.formControl}>
                  <label className={styles.label}>Type</label>
                  <select
                    className={styles.select}
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'classique' | 'hor_écran' })}
                  >
                    <option value="classique">Classique</option>
                    <option value="hor_écran">Hors écran</option>
                  </select>
                </div>

                <div className={styles.formControl}>
                  <label className={styles.label}>Ranking</label>
                  <select
                    className={styles.select}
                    value={form.ranking}
                    onChange={(e) => setForm({ ...form, ranking: Number(e.target.value) })}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>

                <div className={styles.formControl}>
                  <label className={styles.label}>Durée (secondes)</label>
                  <input
                    className={styles.input}
                    type="number"
                    value={form.duree}
                    onChange={(e) => setForm({ ...form, duree: Number(e.target.value) })}
                  />
                </div>

                <div className={styles.formControl}>
                  <label className={styles.label}>Date Début</label>
                  <input
                    className={styles.input}
                    type="date"
                    value={form.date_début}
                    onChange={(e) => setForm({ ...form, date_début: e.target.value })}
                  />
                </div>

                <div className={styles.formControl}>
                  <label className={styles.label}>Date Fin</label>
                  <input
                    className={styles.input}
                    type="date"
                    value={form.date_fin}
                    onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.buttonSecondary} onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className={styles.button} onClick={saveCampagne}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
