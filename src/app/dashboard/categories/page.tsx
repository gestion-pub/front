'use client';

import * as React from 'react';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { Pencil } from '@phosphor-icons/react/dist/ssr/Pencil';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';
import { categoriesService } from '@/services/categories.service';
import type { Categorie } from '@/types/api';
import styles from './categories.module.css';

export default function CategoriesPage(): React.JSX.Element {
  const [categories, setCategories] = React.useState<Categorie[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ nom_categorie: '' });
  const [editingCategorie, setEditingCategorie] = React.useState<Categorie | null>(null);
  const [openDialog, setOpenDialog] = React.useState(false);

  /* ===== LOAD DATA ===== */
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (error_) {
      setError('Failed to load categories');
      console.error('Error loading categories:', error_);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadCategories();
  }, []);

  /* ===== ACTIONS ===== */
  const handleSave = async () => {
    if (!form.nom_categorie.trim()) return;

    try {
      await (editingCategorie
        ? categoriesService.update(editingCategorie.id, form)
        : categoriesService.create(form));

      await loadCategories();
      setForm({ nom_categorie: '' });
      setEditingCategorie(null);
      setOpenDialog(false);
    } catch (error_) {
      console.error('Error saving category:', error_);
      alert('Failed to save category');
    }
  };

  const handleEdit = (categorie: Categorie) => {
    setEditingCategorie(categorie);
    setForm({ nom_categorie: categorie.nom_categorie });
    setOpenDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      await categoriesService.delete(id);
      await loadCategories();
    } catch (error_) {
      console.error('Error deleting category:', error_);
      alert('Failed to delete category');
    }
  };

  const handleAddClick = () => {
    setForm({ nom_categorie: '' });
    setEditingCategorie(null);
    setOpenDialog(true);
  };

  /* ===== UI ===== */
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Catégories</h1>
        <button className={styles.button} onClick={handleAddClick}>
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingContainer}>
          <p>Loading categories...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={loadCategories} className={styles.buttonSecondary}>
            Retry
          </button>
        </div>
      )}

      {/* Grid List */}
      {!loading && !error && (
        <div className={styles.grid}>
          {categories.length === 0 && (
            <div className={styles.emptyState}>
              <p>Aucune catégorie</p>
            </div>
          )}

          {categories.map((cat) => (
            <div key={cat.id} className={styles.card}>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{cat.nom_categorie}</h3>
              </div>
              <div className={styles.cardActions}>
                <button className={styles.iconButton} onClick={() => handleEdit(cat)} title="Edit">
                  <Pencil size={20} />
                </button>
                <button
                  className={`${styles.iconButton} ${styles.iconButtonError}`}
                  onClick={() => handleDelete(cat.id)}
                  title="Delete"
                >
                  <Trash size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      {openDialog ? (
        <div className={styles.modalOverlay} onClick={() => setOpenDialog(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingCategorie ? 'Edit Category' : 'Add Category'}
              </h2>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formControl}>
                <label className={styles.label}>Nom de la catégorie</label>
                <input
                  className={styles.input}
                  value={form.nom_categorie}
                  onChange={(e) => setForm({ nom_categorie: e.target.value })}
                  autoFocus
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.buttonSecondary} onClick={() => setOpenDialog(false)}>
                Cancel
              </button>
              <button className={styles.button} onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
