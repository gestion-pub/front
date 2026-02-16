'use client';

import * as React from 'react';
import { useRouter } from '@/i18n/routing';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { X } from '@phosphor-icons/react/dist/ssr/X';
import { PermissionGuard } from '@/components/core/permission-guard';
import styles from './conducteurs.module.css';
import { conducteursService } from '@/services/conducteurs.service';
import { planningsService } from '@/services/plannings.service';
import type { Conducteur } from '@/types/conducteur';

export default function ConducteursPage(): React.JSX.Element {
  const router = useRouter();
  const [conducteurs, setConducteurs] = React.useState<Conducteur[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [openModal, setOpenModal] = React.useState(false);

  // New Conducteur Form
  const [newConducteurName, setNewConducteurName] = React.useState('');
  const [newConducteurDate, setNewConducteurDate] = React.useState(new Date().toISOString().split('T')[0]);

  // Plannings for selected date (modal)
  const [datePlannings, setDatePlannings] = React.useState<any[]>([]);
  const [loadingPlannings, setLoadingPlannings] = React.useState(false);

  // All programmed plannings for counts
  const [allProgrammedPlannings, setAllProgrammedPlannings] = React.useState<any[]>([]);

  // Date filter
  const [filterDate, setFilterDate] = React.useState<string>('');

  const fetchConducteurs = async () => {
    try {
      setLoading(true);
      const data = await conducteursService.getAll();
      setConducteurs(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch conducteurs:', err);
      setError('Failed to load conducteurs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlannings = async () => {
    try {
      const response = await planningsService.getAll(true);
      const data = Array.isArray(response) ? response : (response.data || []);
      const programmed = data.filter((p: any) => {
        const status = p.status ? String(p.status).trim().toLowerCase() : '';
        return status === 'programmé' || status === 'programme';
      });
      setAllProgrammedPlannings(programmed);
    } catch (err) {
      console.error('Failed to fetch plannings for counts:', err);
    }
  };

  React.useEffect(() => {
    fetchConducteurs();
    fetchPlannings();
  }, []);

  // Filter conducteurs by date
  const filteredConducteurs = React.useMemo(() => {
    if (!filterDate) return conducteurs;
    return conducteurs.filter(c => c.date === filterDate);
  }, [conducteurs, filterDate]);

  // Fetch plannings for selected date
  React.useEffect(() => {
    const fetchPlanningsForDate = async () => {
      if (!newConducteurDate) return;

      try {
        setLoadingPlannings(true);
        console.log('Fetching plannings for date:', newConducteurDate);

        // We can reuse allProgrammedPlannings if we already have them
        if (allProgrammedPlannings.length > 0) {
          const filtered = allProgrammedPlannings.filter((p: any) => {
            const pDate = p.date ? p.date.split('T')[0] : '';
            return pDate === newConducteurDate;
          });
          setDatePlannings(filtered);
          setLoadingPlannings(false);
          return;
        }

        const response = await planningsService.getAll(true);
        const plannings = Array.isArray(response) ? response : (response.data || []);

        const filtered = plannings.filter((p: any) => {
          const pDate = p.date ? p.date.split('T')[0] : '';
          const matchesDate = pDate === newConducteurDate;
          const status = p.status ? String(p.status).trim().toLowerCase() : '';
          const isProgrammed = status === 'programmé' || status === 'programme';
          return matchesDate && isProgrammed;
        });
        setDatePlannings(filtered);
      } catch (err) {
        console.error('Failed to fetch plannings:', err);
      } finally {
        setLoadingPlannings(false);
      }
    };

    if (openModal) {
      fetchPlanningsForDate();
    }
  }, [newConducteurDate, openModal, allProgrammedPlannings]);

  const handleCreate = async () => {
    if (!newConducteurName || !newConducteurDate) return;

    try {
      const newConducteur = await conducteursService.create({
        name: newConducteurName,
        date: newConducteurDate,
        status: 'draft',
        slots: []
      });

      setOpenModal(false);
      // Navigate to detail page for editing
      router.push(`/dashboard/conducteurs/${newConducteur.id}`);
    } catch (err) {
      console.error('Failed to create conducteur:', err);
      alert('Failed to create conducteur');
    }
  };

  // Helper to format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Conducteurs</h1>
        <div className={styles.headerActions}>
          <div className={styles.dateFilter}>
            <CalendarBlank size={20} />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className={styles.dateInput}
              placeholder="Filtrer par date"
            />
            {filterDate && (
              <button
                className={styles.clearButton}
                onClick={() => setFilterDate('')}
                title="Effacer le filtre"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <PermissionGuard permission="create_conducteur">
            <button className={styles.button} onClick={() => setOpenModal(true)}>
              <Plus size={20} />
              Nouveau Conducteur
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className={styles.errorContainer}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className={styles.loadingContainer}>
          Chargement...
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredConducteurs.length === 0 ? (
            <div className={styles.emptyState}>
              {filterDate ? 'Aucun conducteur trouvé pour cette date' : 'Aucun conducteur'}
            </div>
          ) : (
            filteredConducteurs.map((conducteur) => (
              <div
                key={conducteur.id}
                className={styles.card}
                onClick={() => router.push(`/dashboard/conducteurs/${conducteur.id}`)}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>{conducteur.name}</h3>
                    <div className={styles.cardDate}>
                      <CalendarBlank size={16} />
                      {formatDate(conducteur.date)}
                    </div>
                  </div>
                  <span className={`${styles.badge} ${conducteur.status === 'published' ? styles.badgePublished : styles.badgeDraft
                    }`}>
                    {conducteur.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </div>

                <div className={styles.cardStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>
                      {Math.max(
                        conducteur.slots?.length || 0,
                        allProgrammedPlannings.filter(p => {
                          const pDate = p.date ? p.date.split('T')[0] : '';
                          return pDate === conducteur.date;
                        }).length
                      )}
                    </span>
                    <span className={styles.statLabel}>Campagnes</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Modal */}
      {openModal && (
        <div className={styles.modalOverlay} onClick={() => setOpenModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Nouveau Conducteur</h2>
              <button className={styles.closeButton} onClick={() => setOpenModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formControl}>
                <label className={styles.label}>Nom du conducteur</label>
                <input
                  className={styles.input}
                  value={newConducteurName}
                  onChange={e => setNewConducteurName(e.target.value)}
                  placeholder="Ex: Conducteur Matin"
                  autoFocus
                />
              </div>
              <div className={styles.formControl}>
                <label className={styles.label}>Date</label>
                <input
                  type="date"
                  className={styles.input}
                  value={newConducteurDate}
                  onChange={e => setNewConducteurDate(e.target.value)}
                />
              </div>

              {/* Plannings for selected date */}
              {newConducteurDate && (
                <div className={styles.planningsSection}>
                  <h3 className={styles.sectionTitle}>
                    Plannings pour le {formatDate(newConducteurDate)}
                  </h3>

                  {loadingPlannings ? (
                    <div className={styles.planningsLoading}>Chargement...</div>
                  ) : datePlannings.length > 0 ? (
                    <div className={styles.planningsList}>
                      {datePlannings.map((planning, idx) => (
                        <div key={idx} className={styles.planningItem}>
                          <div className={styles.planningTime}>{planning.heure}</div>
                          <div className={styles.planningDetails}>
                            <div className={styles.planningSpot}>{planning.spot}</div>
                            <div className={styles.planningDuration}>{planning.duree}s</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.planningsEmpty}>
                      Aucun planning pour cette date
                    </div>
                  )}
                </div>
              )}
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
                onClick={handleCreate}
                disabled={!newConducteurName || !newConducteurDate}
              >
                Créer et Éditer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
