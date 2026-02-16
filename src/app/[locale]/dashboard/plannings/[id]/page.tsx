'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { PencilSimple } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { DownloadSimple } from '@phosphor-icons/react/dist/ssr/DownloadSimple';
import { UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';
import { planningsService } from '@/services/plannings.service';
import { campagnesService } from '@/services/campagnes.service';
import { PermissionGuard } from '@/components/core/permission-guard';
import type { Campagne } from '@/types/api';
import styles from './planning-detail.module.css';

type PlanningEntry = {
    id: number;
    date: string;
    heure: string;
    duree: number;
    spot: string;
    status?: 'réservé' | 'programmé';
};

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

export default function PlanningDetailPage(): React.JSX.Element {
    const params = useParams();
    const router = useRouter();
    const campaignId = Number(params.id);

    const [campaign, setCampaign] = React.useState<Campagne | null>(null);
    const [campagnes, setCampagnes] = React.useState<Campagne[]>([]);
    const [plannings, setPlannings] = React.useState<PlanningEntry[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [currentStatus, setCurrentStatus] = React.useState<'réservé' | 'programmé'>('réservé');

    // Edit Modal State
    const [open, setOpen] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [form, setForm] = React.useState<PlanningFormData>({
        id_campagne: 0,
        spot: '',
        duree: '',
        prixHT: '',
        dates: [{ date: '', hours: [''] }],
    });
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const loadData = async () => {
        try {
            const [campagnesData] = await Promise.all([
                campagnesService.getAll()
            ]);

            setCampagnes(campagnesData);
            const foundCampaign = campagnesData.find((c: Campagne) => c.id === campaignId);
            setCampaign(foundCampaign || null);

            const response = await planningsService.getByCampaignId(campaignId);
            const campaignPlannings = response.data;
            setPlannings(campaignPlannings);

            // Determine overall status (if any planning is programmé, show programmé)
            const hasProgammed = Array.isArray(campaignPlannings) && campaignPlannings.some((p: any) => p.status === 'programmé');
            setCurrentStatus(hasProgammed ? 'programmé' : 'réservé');
        } catch (err) {
            console.error('Failed to load planning data', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadData();
    }, [campaignId]);

    // Debug: Log planning times to see what's not being displayed
    React.useEffect(() => {
        if (plannings.length > 0) {
            console.log('Total plannings loaded:', plannings.length);
            console.log('Planning times:', plannings.map(p => ({ date: p.date, heure: p.heure })));
        }
    }, [plannings]);

    const handleStatusChange = async (newStatus: 'réservé' | 'programmé') => {
        try {
            // Update all plannings for this campaign
            await Promise.all(
                plannings.map(planning =>
                    planningsService.updateStatus(planning.id, newStatus)
                )
            );

            setCurrentStatus(newStatus);
            await loadData(); // Reload to get updated data
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Erreur lors de la mise à jour du statut');
        }
    };

    if (loading) {
        return <div className={styles.container}>Loading...</div>;
    }

    if (!campaign) {
        return (
            <div className={styles.container}>
                <p>Campaign not found</p>
                <button onClick={() => router.push('/dashboard/plannings')}>
                    Back to Plannings
                </button>
            </div>
        );
    }

    // Generate date range from campaign
    const generateDateRange = () => {
        const dates: Date[] = [];
        const start = new Date(campaign.date_debut);
        const end = new Date(campaign.date_fin);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
        }

        return dates;
    };

    const dateRange = generateDateRange();

    // Generate time slots dynamically from actual planning times
    const generateTimeSlots = () => {
        // Extract all unique times from plannings
        const uniqueTimes = new Set<string>();

        plannings.forEach(p => {
            // Extract HH:MM from the time string
            const timeMatch = p.heure.match(/^(\d{2}):(\d{2})/);
            if (timeMatch) {
                uniqueTimes.add(`${timeMatch[1]}:${timeMatch[2]}`);
            }
        });

        // Convert to array and sort
        const sortedTimes = Array.from(uniqueTimes).sort();

        // If no plannings yet, return default time slots
        if (sortedTimes.length === 0) {
            const defaultSlots: string[] = [];
            for (let hour = 7; hour < 19; hour++) {
                for (let min = 0; min < 60; min += 15) {
                    const h = hour.toString().padStart(2, '0');
                    const m = min.toString().padStart(2, '0');
                    defaultSlots.push(`${h}:${m}`);
                }
            }
            return defaultSlots;
        }

        return sortedTimes;
    };

    const timeSlots = generateTimeSlots();

    // Check if a planning exists for a given date and time
    const hasPlanning = (date: Date, time: string): boolean => {
        const dateStr = date.toISOString().split('T')[0];
        return plannings.some(p => p.date === dateStr && p.heure.startsWith(time));
    };

    // Filter time slots to show only those with plannings
    const activTimeSlots = timeSlots.filter(time =>
        dateRange.some(date => hasPlanning(date, time))
    );

    // Debug logging (only log once when plannings change)
    if (plannings.length > 0 && activTimeSlots.length > 0) {
        const displayedPlannings = plannings.filter(p => {
            const timePrefix = p.heure.substring(0, 5);
            return activTimeSlots.some(slot => timePrefix.startsWith(slot));
        });

        if (displayedPlannings.length < plannings.length) {
            const missing = plannings.filter(p => !displayedPlannings.includes(p));
            console.log('DEBUG: Total plannings:', plannings.length);
            console.log('DEBUG: Displayed plannings:', displayedPlannings.length);
            console.log('DEBUG: Missing plannings:', missing.map(p => ({ date: p.date, heure: p.heure })));
        }
    }

    const formatDate = (date: Date) => {
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const day = days[date.getDay()];
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day} ${d}/${m}`;
    };

    /* -------- Form Handlers (Ported from plannings/page.tsx) -------- */
    const handleEditClick = () => {
        console.log('Edit clicked');
        if (!campaign) {
            console.error('No campaign found to edit');
            return;
        }

        try {
            console.log('Processing plannings for edit:', plannings);
            // Group plannings by date
            const groupedDates = new Map<string, string[]>();
            plannings.forEach(p => {
                const currentHours = groupedDates.get(p.date) || [];
                // Assuming p.heure is "HH:MM:SS" or "HH:MM", take first 5 chars
                const time = p.heure ? p.heure.substring(0, 5) : '';
                if (time && !currentHours.includes(time)) {
                    currentHours.push(time);
                }
                groupedDates.set(p.date, currentHours);
            });

            const dates: PlanningDate[] = Array.from(groupedDates.entries()).map(([date, hours]) => ({
                date,
                hours: hours.sort() // sort hours
            }));

            if (dates.length === 0) {
                dates.push({ date: '', hours: [''] });
            }

            console.log('Setting form with dates:', dates);
            setForm({
                id_campagne: campaign.id,
                spot: campaign.spot?.toString() || '',
                duree: campaign.duree?.toString() || '',
                prixHT: '',
                dates: dates
            });

            setOpen(true);
        } catch (error) {
            console.error('Error preparing edit form:', error);
            alert('Error opening edit modal');
        }
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
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
        updated[dateIndex].hours = updated[dateIndex].hours.filter((_, i) => i !== hourIndex);
        setForm({ ...form, dates: updated });
    };

    const updateHour = (dateIndex: number, hourIndex: number, value: string) => {
        const updated = [...form.dates];
        updated[dateIndex].hours[hourIndex] = value;
        setForm({ ...form, dates: updated });
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !campaign) return;

        const context = {
            startDate: campaign.date_debut,
            endDate: campaign.date_fin
        };

        try {
            const result = await planningsService.uploadAndAnalyze(file, context);
            if (result.status === 'success') {
                let newDates: PlanningDate[] = [];

                // --- ENHANCED NORMALIZATION ---
                let importedData = result.data;

                // If data is wrapped in another object (common in AI responses)
                if (importedData && !Array.isArray(importedData)) {
                    // Look for common keys where lists might be hidden
                    const commonKeys = ['extracted_data', 'data', 'plannings', 'results', 'dates', 'items', 'content', 'resultat_ia'];
                    for (const key of commonKeys) {
                        if (importedData[key] && Array.isArray(importedData[key])) {
                            console.log(`Found data in key: ${key}`);
                            importedData = importedData[key];
                            break;
                        }
                    }
                }

                if (Array.isArray(importedData)) {
                    console.log('Final data array to process:', importedData);
                    newDates = importedData.map((item: any) => ({
                        date: item.date || item.day || item.datetime || '',
                        hours: Array.isArray(item.hours) ? item.hours :
                            (Array.isArray(item.slots) ? item.slots :
                                (item.heure ? [item.heure] :
                                    (item.time ? [item.time] : [])))
                    }));
                } else if (typeof importedData === 'object' && importedData !== null) {
                    // Handle object with dates as keys
                    if (importedData.date) { // Single object
                        newDates.push({
                            date: importedData.date,
                            hours: Array.isArray(importedData.hours) ? importedData.hours :
                                (importedData.heure ? [importedData.heure] :
                                    (importedData.time ? [importedData.time] : []))
                        });
                    } else {
                        // Check if it's an object where keys are dates
                        const entries = Object.entries(importedData);
                        const dateLikeKeys = entries.filter(([key]) => /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/.test(key));
                        if (dateLikeKeys.length > 0) {
                            console.log('Found object with date-like keys');
                            newDates = dateLikeKeys.map(([date, hours]) => ({
                                date,
                                hours: Array.isArray(hours) ? hours : [String(hours)]
                            }));
                        }
                    }
                }

                if (newDates.length > 0) {
                    // Filter out empty entries
                    const validDates = newDates.filter(d => d.date);

                    if (validDates.length > 0) {
                        setForm(prev => {
                            const currentDates = prev.dates.filter(d => d.date || (d.hours.length === 1 && d.hours[0] === ''));
                            const isOnlyEmpty = currentDates.length === 1 && !currentDates[0].date && currentDates[0].hours[0] === '';
                            return {
                                ...prev,
                                dates: isOnlyEmpty ? validDates : [...prev.dates, ...validDates]
                            };
                        });
                        alert(`Import successful! Added ${validDates.length} dates.`);
                    }
                } else {
                    alert('Could not extract date structure from file. Please check console for data format.');
                    console.log('Server response structure:', result);
                }
            } else {
                alert('Import failed: ' + result.message);
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Failed to upload file');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSave = async () => {
        if (saving) return; // Prevent multiple clicks

        setSaving(true);
        try {
            console.log('Starting save operation...');
            console.log('Form data:', form.dates);

            // Strategy: Just create new plannings without deleting
            // The user can manually delete old ones if needed, or we can implement a smarter diff later
            // This avoids the rate limit issue from making too many delete requests

            let createdCount = 0;
            const planningsToSave: any[] = [];

            for (const d of form.dates) {
                if (!d.date) continue;

                for (const h of d.hours) {
                    if (!h) continue;

                    planningsToSave.push({
                        spot: form.spot,
                        duree: Number(form.duree),
                        prix_HT: Number(form.prixHT || 0),
                        date: d.date,
                        heure: h,
                        status: currentStatus
                    });
                    createdCount++;
                }
            }

            if (planningsToSave.length > 0) {
                await planningsService.bulkCreate(form.id_campagne, planningsToSave);
                alert(`Successfully synchronized ${createdCount} planning entries!`);
            } else {
                alert('No plannings to save.');
            }

            setOpen(false);
            await loadData();
        } catch (err: any) {
            console.error('Save operation failed:', err);
            alert(`Failed to save: ${err?.response?.data?.message || err?.message || 'Unknown error'}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAll = async () => {
        if (!campaign) return;

        const confirmDelete = window.confirm(
            `Are you sure you want to delete ALL ${plannings.length} plannings for campaign "${campaign.spot}"? This action cannot be undone.`
        );

        if (!confirmDelete) return;

        try {
            // Delete all plannings for this campaign
            await Promise.all(
                plannings.map(p => planningsService.delete(p.id))
            );

            alert(`Successfully deleted ${plannings.length} plannings.`);
            await loadData(); // Reload to show empty state
        } catch (err: any) {
            console.error('Failed to delete plannings:', err);
            alert(`Failed to delete plannings: ${err?.response?.data?.message || err?.message || 'Unknown error'}`);
        }
    };

    const handleExport = async () => {
        if (!plannings || plannings.length === 0) {
            alert('Aucun planning à exporter.');
            return;
        }

        try {
            await planningsService.exportToExcel(campaignId, String(campaign?.spot || 'planning'));
        } catch (error) {
            console.error('Export failed:', error);
            alert("Erreur lors de l'export du fichier Excel");
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => router.push('/dashboard/plannings')}>
                    <ArrowLeft size={20} />
                    Retour
                </button>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>{campaign.spot}</h1>
                    <div className={styles.campaignInfo}>
                        <span className={styles.badge}>Durée: {campaign.duree}s</span>
                        <span className={styles.badge}>
                            {formatDate(new Date(campaign.date_debut))} - {formatDate(new Date(campaign.date_fin))}
                        </span>
                    </div>
                </div>
                <div className={styles.actions} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <PermissionGuard permission="read_planning">
                        <button className={styles.statusButton} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }} onClick={handleExport}>
                            <DownloadSimple size={18} />
                            Export
                        </button>
                    </PermissionGuard>
                    <PermissionGuard permission="update_planning">
                        <button className={styles.statusButton} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }} onClick={handleEditClick}>
                            <PencilSimple size={18} />
                            Modifier
                        </button>
                    </PermissionGuard>
                    <PermissionGuard permission="delete_planning">
                        <button
                            className={styles.statusButton}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}
                            onClick={handleDeleteAll}
                            disabled={plannings.length === 0}
                        >
                            <Trash size={18} />
                            Supprimer tout
                        </button>
                    </PermissionGuard>
                    <PermissionGuard permission="update_planning">
                        <div className={styles.statusButtons}>
                            <button
                                className={`${styles.statusButton} ${currentStatus === 'programmé' ? styles.statusButtonActive : ''}`}
                                onClick={() => handleStatusChange('programmé')}
                            >
                                Programmé
                            </button>
                            <button
                                className={`${styles.statusButton} ${styles.statusButtonReserve} ${currentStatus === 'réservé' ? styles.statusButtonActive : ''}`}
                                onClick={() => handleStatusChange('réservé')}
                            >
                                Réservé
                            </button>
                        </div>
                    </PermissionGuard>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className={styles.gridWrapper}>
                <div className={styles.gridContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.timeHeader}>Time</th>
                                {dateRange.map((date, idx) => (
                                    <th key={idx} className={styles.dateHeader}>
                                        {formatDate(date)}
                                    </th>
                                ))}
                                <th className={styles.summaryHeader}>Nbre Passage sem</th>
                                <th className={styles.summaryHeader}>week</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activTimeSlots.map((time, timeIdx) => (
                                <tr key={timeIdx}>
                                    <td className={styles.timeCell}>{time}</td>
                                    {dateRange.map((date, dateIdx) => (
                                        <td
                                            key={dateIdx}
                                            className={`${styles.gridCell} ${hasPlanning(date, time) ? styles.gridCellActive : ''}`}
                                        >
                                            {hasPlanning(date, time) && (
                                                <div className={styles.durationBox}>
                                                    {campaign.duree}"
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                    <td className={styles.summaryCell}>
                                        {dateRange.filter(d => hasPlanning(d, time)).length}
                                    </td>
                                    <td className={styles.summaryCell}>0.00</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Footer */}
            <div className={styles.footer}>
                <div className={styles.footerStats}>
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Total Plannings:</span>
                        <span className={styles.statValue}>{plannings.length}</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Période:</span>
                        <span className={styles.statValue}>
                            {dateRange.length} jours
                        </span>
                    </div>
                </div>
            </div>
            {/* Edit Modal */}
            {open ? (
                <div className={styles.modalOverlay} onClick={() => setOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Modifier le planning</h2>
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
                                    <div className={styles.formDateHeader}>
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
                            <button className={styles.buttonSecondary} onClick={() => setOpen(false)} disabled={saving}>Cancel</button>
                            <button className={styles.button} onClick={handleSave} disabled={!form.id_campagne || saving}>
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
