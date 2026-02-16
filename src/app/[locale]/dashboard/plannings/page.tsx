'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { CompaniesFilters } from '@/components/dashboard/plannings/plannings-filters';
import { planningsService } from '@/services/plannings.service';
import { campagnesService } from '@/services/campagnes.service';
import { PermissionGuard } from '@/components/core/permission-guard';
import type { Campagne } from '@/types/api';
import styles from './plannings.module.css';

/* ---------------- TYPES ---------------- */
type PlanningDate = {
  date: string;
  hours: string[];
  spot?: string;
};

type PlanningFormData = {
  id_campagne: number;
  spot: string;
  duree: string;
  prixHT: string;
  dates: PlanningDate[];
};

type CampaignPlanningGroup = {
  id_campagne: number;
  campaignName: string;
  duree: number;
  date_debut: string;
  date_fin: string;
  planningCount: number;
  status?: 'réservé' | 'programmé';
};

/* ---------------- PAGE ---------------- */
export default function Page(): React.JSX.Element {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [campagnes, setCampagnes] = React.useState<Campagne[]>([]);
  const [campaignGroups, setCampaignGroups] = React.useState<CampaignPlanningGroup[]>([]);

  const [form, setForm] = React.useState<PlanningFormData>({
    id_campagne: 0,
    spot: '',
    duree: '',
    prixHT: '',
    dates: [{ date: '', hours: [''] }],
  });

  const loadPlannings = async () => {
    try {
      const [planningsData, campagnesData] = await Promise.all([
        planningsService.getAll(true),
        campagnesService.getAll()
      ]);

      // Group plannings by campaign
      const grouped = new Map<number, CampaignPlanningGroup>();

      planningsData.data.forEach((planning: any) => {
        const campagne = campagnesData.find((c: Campagne) => c.id === planning.id_campagne);

        if (campagne && !grouped.has(planning.id_campagne)) {
          grouped.set(planning.id_campagne, {
            id_campagne: planning.id_campagne,
            campaignName: campagne.spot?.toString() || `Campaign ${planning.id_campagne}`,
            duree: campagne.duree || 0,
            date_debut: campagne.date_debut,
            date_fin: campagne.date_fin,
            planningCount: 0,
            status: 'réservé' // Default status
          });
        }

        if (grouped.has(planning.id_campagne)) {
          const group = grouped.get(planning.id_campagne)!;
          group.planningCount++;

          // If any planning is programmé, mark the whole campaign as programmé
          if (planning.status === 'programmé') {
            group.status = 'programmé';
          }
        }
      });

      setCampaignGroups(Array.from(grouped.values()));
      setCampagnes(campagnesData);
    } catch (err) {
      console.error('Failed to load plannings', err);
    }
  };

  React.useEffect(() => {
    loadPlannings();
  }, []);

  /* -------- Form handlers -------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCampagneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const campagneId = Number(e.target.value);
    const selectedCampagne = campagnes.find(c => c.id === campagneId);

    if (selectedCampagne) {
      setForm({
        ...form,
        id_campagne: campagneId,
        spot: String(selectedCampagne.spot),
        duree: String(selectedCampagne.duree || ''),
      });
    } else {
      setForm({ ...form, id_campagne: 0, spot: '', duree: '' });
    }
  };

  const addDate = () => {
    setForm({
      ...form,
      dates: [...form.dates, { date: '', hours: [''] }],
    });
  };

  const removeDate = (index: number) => {
    setForm({
      ...form,
      dates: form.dates.filter((_, i) => i !== index),
    });
  };

  const updateDate = (index: number, value: string) => {
    const updated = [...form.dates];
    updated[index].date = value;
    setForm({ ...form, dates: updated });
  };

  const addHour = (dateIndex: number) => {
    const updated = [...form.dates];
    updated[dateIndex].hours.push('');
    setForm({ ...form, dates: updated });
  };

  const removeHour = (dateIndex: number, hourIndex: number) => {
    const updated = [...form.dates];
    updated[dateIndex].hours = updated[dateIndex].hours.filter(
      (_, i) => i !== hourIndex
    );
    setForm({ ...form, dates: updated });
  };

  const updateHour = (dateIndex: number, hourIndex: number, value: string) => {
    const updated = [...form.dates];
    updated[dateIndex].hours[hourIndex] = value;
    setForm({ ...form, dates: updated });
  };

  const handleSave = async () => {
    try {
      const planningsToSave: any[] = [];

      // Collect all planning entries from the form
      for (const d of form.dates) {
        if (!d.date) continue;

        for (const h of d.hours) {
          if (!h) continue;

          planningsToSave.push({
            spot: form.spot,
            duree: Number(form.duree),
            prix_HT: Number(form.prixHT),
            date: d.date,
            heure: h
          });
        }
      }

      if (planningsToSave.length > 0) {
        await planningsService.bulkCreate(form.id_campagne, planningsToSave);
      }

      await loadPlannings();
      setForm({ id_campagne: 0, spot: '', duree: '', prixHT: '', dates: [{ date: '', hours: [''] }] });
      setOpen(false);
    } catch (err) {
      console.error('Failed to create plannings', err);
      alert('Failed to save plannings');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const handleCampaignClick = (id_campagne: number) => {
    router.push(`/dashboard/plannings/${id_campagne}`);
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Find selected campaign to get dates
    const selectedCampaign = campagnes.find(c => c.id === form.id_campagne);
    const context = selectedCampaign ? {
      startDate: selectedCampaign.date_debut,
      endDate: selectedCampaign.date_fin
    } : undefined;

    try {
      const result = await planningsService.uploadAndAnalyze(file, context);
      console.log('Analysis result from server:', result);

      if (result.status === 'success') {
        // trust the backend's standardized structure { date, hours }
        const importedData = result.data || [];

        if (Array.isArray(importedData) && importedData.length > 0) {
          const validDates = importedData.filter((item: any) => item.date && Array.isArray(item.hours) && item.hours.length > 0);

          if (validDates.length > 0) {
            setForm(prev => {
              const isOnlyEmpty = prev.dates.length === 1 && !prev.dates[0].date && prev.dates[0].hours[0] === '';
              return {
                ...prev,
                dates: isOnlyEmpty ? validDates : [...prev.dates, ...validDates]
              };
            });
            alert(`Importation réussie ! ${validDates.length} jours ajoutés.`);
          } else {
            alert('Aucune donnée valide n\'a été trouvée dans le fichier.');
          }
        } else {
          alert('L\'intelligence artificielle n\'a détecté aucune planification dans cette image.');
        }
      } else {
        alert('Erreur d\'importation : ' + result.message);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Échec de l\'envoi du fichier au serveur.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Plannings</h1>
          <div className={styles.actions}>
            {/* Export button removed */}
          </div>
        </div>
        <PermissionGuard permission="create_planning">
          <button className={styles.button} onClick={() => setOpen(true)}>
            <PlusIcon size={20} />
            Add
          </button>
        </PermissionGuard>
      </div>

      {/* Filters */}
      <CompaniesFilters />

      {/* Campaign Grid */}
      <div className={styles.grid}>
        {campaignGroups.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: '#666' }}>
            <p>Aucun planning configuré.</p>
            <button className={styles.button} onClick={() => setOpen(true)} style={{ marginTop: '16px' }}>
              <PlusIcon size={20} />
              Créer un planning
            </button>
          </div>
        )}

        {campaignGroups.map((group) => (
          <div
            key={group.id_campagne}
            className={styles.planningCard}
            onClick={() => handleCampaignClick(group.id_campagne)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.cardHeader}>
              <h3 className={styles.dateTitle}>
                <span>📅</span>
                {group.campaignName}
              </h3>
              <span className={`${styles.statusBadge} ${group.status === 'programmé' ? styles.statusProgramme : styles.statusReserve}`}>
                {group.status === 'programmé' ? 'Programmé' : 'Réservé'}
              </span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Durée:</span>
                <span className={styles.value}>{group.duree}s</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Période:</span>
                <span className={styles.value}>
                  {formatDate(group.date_debut)} - {formatDate(group.date_fin)}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Plannings:</span>
                <span className={styles.value}>{group.planningCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {open ? (
        <div className={styles.modalOverlay} onClick={() => setOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Plannings</h2>
            </div>
            <div className={styles.modalBody}>
              {/* Campaign Selection */}
              <div className={styles.formControl}>
                <label className={styles.label}>Campagne *</label>
                <select
                  className={styles.input}
                  value={form.id_campagne}
                  onChange={handleCampagneChange}
                >
                  <option value={0}>Sélectionner une campagne</option>
                  {campagnes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.spot} ({c.duree}s) - {c.client?.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Read only info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className={styles.formControl}>
                  <label className={styles.label}>Spot (Auto)</label>
                  <input className={styles.input} value={form.spot} disabled readOnly />
                </div>
                <div className={styles.formControl}>
                  <label className={styles.label}>Durée (Auto)</label>
                  <input className={styles.input} value={form.duree} disabled readOnly />
                </div>
              </div>

              <div className={styles.formControl}>
                <label className={styles.label}>Prix HT</label>
                <input
                  className={styles.input}
                  type="number"
                  name="prixHT"
                  value={form.prixHT}
                  onChange={handleChange}
                  placeholder="Ex: 500"
                />
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '8px 0' }} />

              {form.dates.map((d, dateIndex) => (
                <div key={dateIndex} className={styles.dateBlock}>
                  <div className={styles.dateHeader}>
                    <div className={styles.formControl}>
                      <label className={styles.label}>Date</label>
                      <input
                        className={styles.input}
                        type="date"
                        value={d.date}
                        onChange={(e) => updateDate(dateIndex, e.target.value)}
                      />
                    </div>
                    {form.dates.length > 1 && (
                      <button
                        className={`${styles.buttonSecondary} ${styles.buttonError}`}
                        onClick={() => removeDate(dateIndex)}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {d.hours.map((hourStr, hourIndex) => {
                      const [currH, currM] = hourStr ? hourStr.split(':') : ['00', '00'];

                      const handleTimeChange = (type: 'h' | 'm', val: string) => {
                        const newH = type === 'h' ? val : currH;
                        const newM = type === 'm' ? val : currM;
                        updateHour(dateIndex, hourIndex, `${newH}:${newM}`);
                      };

                      const currentCampagne = campagnes.find(c => c.id === form.id_campagne);
                      const isClassique = currentCampagne?.type === 'classique';

                      const allowedMinutes = isClassique
                        ? ['00', '15', '30', '45']
                        : Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

                      return (
                        <div key={hourIndex} className={styles.hourRow}>
                          <div className={styles.formControl} style={{ flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                            <label className={styles.label} style={{ whiteSpace: 'nowrap', minWidth: '60px' }}>Hour {hourIndex + 1}</label>

                            <select
                              className={styles.input}
                              style={{ width: '70px' }}
                              value={currH}
                              onChange={(e) => handleTimeChange('h', e.target.value)}
                            >
                              {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>

                            <span>:</span>

                            <select
                              className={styles.input}
                              style={{ width: '70px' }}
                              value={currM}
                              onChange={(e) => handleTimeChange('m', e.target.value)}
                            >
                              {allowedMinutes.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>

                          </div>
                          {d.hours.length > 1 && (
                            <button
                              className={`${styles.buttonSecondary} ${styles.buttonError}`}
                              onClick={() => removeHour(dateIndex, hourIndex)}
                              style={{ alignSelf: 'center', marginBottom: '0' }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      )
                    })}
                    <button
                      className={styles.buttonSecondary}
                      onClick={() => addHour(dateIndex)}
                      style={{ width: 'fit-content' }}
                    >
                      + Add hour
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button className={styles.button} onClick={addDate}>
                  + Add new date
                </button>
                <div style={{ position: 'relative' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".jpg,.jpeg,.png,.pdf,.xlsx,.xls,.csv"
                    onChange={handleFileChange}
                  />
                  <button className={styles.buttonSecondary} onClick={handleImportClick}>
                    <UploadIcon />
                    Import
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.buttonSecondary} onClick={() => setOpen(false)}>Cancel</button>
              <button className={styles.button} onClick={handleSave} disabled={!form.id_campagne}>Save</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
