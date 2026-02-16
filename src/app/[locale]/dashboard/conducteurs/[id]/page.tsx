'use client';

import * as React from 'react';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { FloppyDisk } from '@phosphor-icons/react/dist/ssr/FloppyDisk';
import { DownloadSimple } from '@phosphor-icons/react/dist/ssr/DownloadSimple';
import { Info } from '@phosphor-icons/react/dist/ssr/Info';
import { Warning } from '@phosphor-icons/react/dist/ssr/Warning';
import { PlusCircle } from '@phosphor-icons/react/dist/ssr/PlusCircle';
import { DotsSixVertical } from '@phosphor-icons/react/dist/ssr/DotsSixVertical';
import Link from 'next/link';
import { useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { conducteursService } from '@/services/conducteurs.service';
import { planningsService } from '@/services/plannings.service';
import { PermissionGuard } from '@/components/core/permission-guard';
import styles from './conducteurs.module.css';

/* ================= TYPES ================= */

interface ScheduleEntry {
    time: string;
    annonceur: string;
    spot: string;
    duree: string;
    numero: string;
    campagne_id?: number;
    categorie_id?: number;
    type_campagne?: string;
}

/* ================= HELPERS ================= */

// Generate time slots from 06:00 to 00:00 (midnight) every 15 minutes
function generateTimeSlots(): string[] {
    const slots: string[] = [];

    for (let hour = 6; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            slots.push(timeStr);
        }
    }

    // Add midnight slot
    slots.push('00:00');

    return slots;
}

// Format date for display
function formatDate(date: Date): string {
    const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName} ${day} ${monthName} ${year}`;
}

/* ================= PAGE ================= */

export default function ConducteursPage(): React.JSX.Element {
    const router = useRouter();
    const params = useParams();
    const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
    const [conducteur, setConducteur] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [schedule, setSchedule] = React.useState<Map<string, ScheduleEntry[]>>(new Map());
    const [openDialog, setOpenDialog] = React.useState(false);
    const [selectedTime, setSelectedTime] = React.useState<string>('');
    const [editingEntryIndex, setEditingEntryIndex] = React.useState<number | null>(null);
    const [form, setForm] = React.useState<ScheduleEntry>({
        time: '',
        annonceur: '',
        spot: '',
        duree: '',
        numero: '',
    });

    const [timeSlots, setTimeSlots] = React.useState<string[]>(() => generateTimeSlots());

    // Drag and Drop State
    const [draggedItem, setDraggedItem] = React.useState<{ time: string; index: number } | null>(null);
    const [dragOverTime, setDragOverTime] = React.useState<string | null>(null);

    // DND Handlers
    const handleDragStart = (e: React.DragEvent, time: string, index: number) => {
        setDraggedItem({ time, index });
        // Set drag ghost image styling if needed, or just let default handle
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, time: string) => {
        e.preventDefault(); // Required to allow drop
        e.dataTransfer.dropEffect = 'move';
        if (dragOverTime !== time) {
            setDragOverTime(time);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Only clear if we are leaving the current target to another or outside
        // Native DND is jittery, so we use a more robust check in handleDragOver usually
    };

    const handleDrop = (e: React.DragEvent, targetTime: string, targetIndex?: number) => {
        e.preventDefault();
        setDragOverTime(null);

        if (!draggedItem) return;
        const { time: sourceTime, index: sourceIndex } = draggedItem;

        if (sourceTime === targetTime) {
            // Reorder within the same slot
            if (targetIndex !== undefined && targetIndex !== sourceIndex) {
                const newSchedule = new Map(schedule);
                const entries = [...(newSchedule.get(sourceTime) || [])];
                const [movedEntry] = entries.splice(sourceIndex, 1);
                entries.splice(targetIndex, 0, movedEntry);
                newSchedule.set(sourceTime, entries);
                setSchedule(newSchedule);
            }
            setDraggedItem(null);
            return;
        }

        const newSchedule = new Map(schedule);
        const sourceEntries = [...(newSchedule.get(sourceTime) || [])];
        const [movedEntry] = sourceEntries.splice(sourceIndex, 1);

        // Update time in entry to match new slot
        const updatedEntry = { ...movedEntry, time: targetTime };

        if (sourceEntries.length === 0) {
            newSchedule.delete(sourceTime);
        } else {
            newSchedule.set(sourceTime, sourceEntries);
        }

        const targetEntries = [...(newSchedule.get(targetTime) || [])];
        if (targetIndex !== undefined) {
            targetEntries.splice(targetIndex, 0, updatedEntry);
        } else {
            targetEntries.push(updatedEntry);
        }
        newSchedule.set(targetTime, targetEntries);

        setSchedule(newSchedule);
        setDraggedItem(null);
    };

    // Load conducteur data
    React.useEffect(() => {
        const loadConducteur = async () => {
            try {
                setLoading(true);
                const data = await conducteursService.getById(Number(params.id));
                setConducteur(data);

                // Set the date from conducteur data
                if (data.date) {
                    const conducteurDate = new Date(data.date);
                    setSelectedDate(conducteurDate);

                    let initialSchedule = new Map<string, ScheduleEntry[]>();

                    // 1. Fetch live plannings for this date
                    try {
                        const planningsResponse = await planningsService.getAll(true);
                        const dateStr = data.date;

                        // Robustly handle response structure
                        const allPlannings = Array.isArray(planningsResponse) ? planningsResponse : (planningsResponse.data || []);

                        console.log(`Checking plannings for date ${dateStr}. Total found: ${allPlannings.length}`);

                        const datePlannings = allPlannings.filter(
                            (p: any) => {
                                const pDate = p.date ? p.date.split('T')[0] : '';
                                const matchesDate = pDate === dateStr;
                                const status = p.status ? String(p.status).trim().toLowerCase() : '';
                                const isProgrammed = status === 'programmé' || status === 'programme';

                                if (matchesDate && !isProgrammed) {
                                    console.log(`Planning at ${p.heure} matches date ${pDate} but has status "${p.status}"`);
                                }

                                return matchesDate && isProgrammed;
                            }
                        );

                        console.log(`Found ${datePlannings.length} programmed plannings for ${dateStr}`);

                        datePlannings.forEach((planning: any) => {
                            const timeWithoutSeconds = planning.heure.substring(0, 5);
                            const entry: ScheduleEntry = {
                                time: timeWithoutSeconds,
                                annonceur: planning.campagne?.client?.name || planning.spot || '',
                                spot: planning.spot || '',
                                duree: String(planning.duree || ''),
                                numero: String(planning.campagne?.spot_id || ''),
                                campagne_id: planning.id_campagne,
                                categorie_id: planning.campagne?.id_categorie,
                                type_campagne: planning.campagne?.type,
                            };

                            const existing = initialSchedule.get(timeWithoutSeconds) || [];
                            initialSchedule.set(timeWithoutSeconds, [...existing, entry]);
                        });
                    } catch (planningError) {
                        console.error('Failed to load plannings:', planningError);
                    }

                    // 2. Overlay with saved slots (these take precedence)
                    if (data.slots && Array.isArray(data.slots) && data.slots.length > 0) {
                        data.slots.forEach((slot: any) => {
                            const time = slot.time_slot || slot.time;
                            if (time) {
                                const timeKey = time.substring(0, 5);
                                const entry: ScheduleEntry = {
                                    time: timeKey,
                                    annonceur: slot.campagne?.client?.name || slot.annonceur || '',
                                    spot: slot.campagne?.spot || slot.spot || '',
                                    duree: String(slot.campagne?.duree || slot.duree || ''),
                                    numero: String(slot.campagne?.spot_id || slot.numero || ''),
                                    campagne_id: slot.campagne_id,
                                    categorie_id: slot.campagne?.id_categorie,
                                    type_campagne: slot.campagne?.type,
                                };

                                const existing = initialSchedule.get(timeKey) || [];
                                // Avoid exact duplicates from overlapping data sources
                                if (!existing.some(e => e.campagne_id === entry.campagne_id && e.spot === entry.spot)) {
                                    initialSchedule.set(timeKey, [...existing, entry]);
                                }
                            }
                        });
                    }

                    setSchedule(initialSchedule);

                    // 3. Update timeSlots with non-standard times (like 10:08)
                    setTimeSlots(prev => {
                        const newSlots = [...prev];
                        Array.from(initialSchedule.keys()).forEach(time => {
                            if (!newSlots.includes(time)) {
                                newSlots.push(time);
                            }
                        });
                        return newSlots.sort();
                    });
                }
            } catch (error) {
                console.error('Failed to load conducteur:', error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            loadConducteur();
        }
    }, [params.id]);

    /* ================= ACTIONS ================= */

    const handleRemoveSlot = (time: string) => {
        if (confirm(`Masquer l'horaire ${time} ?`)) {
            setTimeSlots(prev => prev.filter(t => t !== time));
        }
    };

    const handleAddClick = (time: string, entryIndex?: number) => {
        setSelectedTime(time);
        if (entryIndex !== undefined) {
            // Editing existing entry
            const entries = schedule.get(time) || [];
            setForm(entries[entryIndex]);
            setEditingEntryIndex(entryIndex);
        } else {
            // Adding new entry
            setForm({
                time,
                annonceur: '',
                spot: '',
                duree: '',
                numero: '',
            });
            setEditingEntryIndex(null);
        }
        setOpenDialog(true);
    };

    const handleModalSave = () => {
        if (!form.annonceur.trim() || !form.spot.trim()) return;

        const newSchedule = new Map(schedule);
        const entries = [...(newSchedule.get(selectedTime) || [])];

        if (editingEntryIndex !== null) {
            entries[editingEntryIndex] = form;
        } else {
            entries.push(form);
        }

        newSchedule.set(selectedTime, entries);
        setSchedule(newSchedule);
        setOpenDialog(false);
    };

    const handleGlobalSave = async () => {
        try {
            const slotsArray: any[] = [];

            schedule.forEach((entries) => {
                entries.forEach(entry => {
                    slotsArray.push({
                        time_slot: entry.time,
                        campagne_id: entry.campagne_id || null,
                    });
                });
            });

            await conducteursService.update(Number(params.id), {
                slots: slotsArray
            });

            alert('Enregistré avec succès !');
        } catch (error) {
            console.error('Failed to save conducteur:', error);
            alert("Erreur lors de l'enregistrement du conducteur.");
        }
    };

    const handleExport = async () => {
        try {
            const data = await conducteursService.export(Number(params.id));
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            const dateStr = selectedDate.toISOString().split('T')[0];
            link.setAttribute('download', `conducteur_${dateStr}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert("Erreur lors de l'export du conducteur.");
        }
    };

    const handleDelete = (time: string, entryIndex?: number) => {
        if (confirm('Supprimer cette entrée ?')) {
            const newSchedule = new Map(schedule);
            if (entryIndex !== undefined) {
                const entries = [...(newSchedule.get(time) || [])];
                entries.splice(entryIndex, 1);
                if (entries.length > 0) {
                    newSchedule.set(time, entries);
                } else {
                    newSchedule.delete(time);
                }
            } else {
                newSchedule.delete(time);
            }
            setSchedule(newSchedule);
        }
    };

    const handleGlobalDelete = async () => {
        if (confirm('Voulez-vous vraiment supprimer ce conducteur ?')) {
            try {
                await conducteursService.delete(Number(params.id));
                router.push('/dashboard/conducteurs');
            } catch (error) {
                console.error('Failed to delete conducteur:', error);
                alert('Erreur lors de la suppression du conducteur.');
            }
        }
    };

    /* ================= UI ================= */

    if (loading) {
        return (
            <div className={styles.container}>
                <div style={{ textAlign: 'center', padding: '48px' }}>
                    Chargement...
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.dateSection}>
                    <Link href="/dashboard/conducteurs" style={{ display: 'flex', alignItems: 'center', color: 'inherit', marginRight: '8px' }}>
                        <ArrowLeft size={24} />
                    </Link>
                    <CalendarBlank size={24} weight="bold" />
                    <h1 className={styles.title}>{formatDate(selectedDate)}</h1>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <PermissionGuard permission="update_conducteur">
                        <button className={styles.saveButton} onClick={handleGlobalSave}>
                            <FloppyDisk size={18} style={{ marginRight: '8px' }} />
                            Sauvegarder
                        </button>
                    </PermissionGuard>
                    <PermissionGuard permission="read_conducteur">
                        <button className={styles.buttonSecondary} onClick={handleExport}>
                            <DownloadSimple size={18} style={{ marginRight: '8px' }} />
                            Export
                        </button>
                    </PermissionGuard>
                    <PermissionGuard permission="delete_conducteur">
                        <button
                            className={styles.buttonSecondary}
                            style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                            onClick={handleGlobalDelete}
                        >
                            <Trash size={18} style={{ marginRight: '8px' }} />
                            Supprimer
                        </button>
                    </PermissionGuard>
                </div>
            </div>

            {/* Schedule Table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.thTime}>Heures</th>
                            <th className={styles.thAnnonceur}>Annonceur</th>
                            <th className={styles.thSpot}>Spots</th>
                            <th className={styles.thDuree}>Durée</th>
                            <th className={styles.thNumero}>Numéro</th>
                            <th className={styles.thActions}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map((time) => {
                            const entries = schedule.get(time) || [];
                            const isDragOver = dragOverTime === time;

                            if (entries.length === 0) {
                                return (
                                    <tr
                                        key={time}
                                        className={`${styles.rowEmpty} ${isDragOver ? styles.dragOver : ''}`}
                                        onClick={() => handleAddClick(time)}
                                        onDragOver={(e) => handleDragOver(e, time)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, time)}
                                    >
                                        <td className={styles.tdTime}>{time}</td>
                                        <td className={styles.tdAnnonceur} colSpan={4}></td>
                                        <td className={styles.tdActions}>
                                            <button
                                                className={styles.deleteButton}
                                                onClick={(e) => { e.stopPropagation(); handleRemoveSlot(time); }}
                                                title="Masquer l'horaire"
                                                style={{ opacity: 0.5 }}
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }

                            const totalDuration = entries.reduce((sum, e) => {
                                const d = parseInt(e.duree) || 0;
                                return sum + d;
                            }, 0);

                            return entries.map((entry, idx) => {
                                const isDragging = draggedItem?.time === time && draggedItem?.index === idx;

                                // Robust normalization for 'Hors écran' detection
                                const rawType = entry.type_campagne || '';
                                const normalizedType = rawType.toLowerCase()
                                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                                    .replace(/[^a-z0-9]/g, ' ');

                                const isHorsEcran = normalizedType.includes('hors') ||
                                    normalizedType.includes('hor') ||
                                    normalizedType.includes('ecran');

                                // Check for concurrence (same category as previous)
                                const isConcurrence = idx > 0 && entry.categorie_id !== undefined &&
                                    entry.categorie_id === entries[idx - 1].categorie_id;

                                return (
                                    <tr
                                        key={`${time}-${idx}`}
                                        className={`${styles.rowFilled} ${isDragOver ? styles.dragOver : ''} ${isDragging ? styles.dragging : ''} ${styles.rowDraggable} ${isHorsEcran ? styles.rowHorsEcran : ''}`}
                                        onClick={() => handleAddClick(time, idx)}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, time, idx)}
                                        onDragOver={(e) => handleDragOver(e, time)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, time, idx)}
                                    >
                                        <td className={styles.tdTime} style={{ color: isHorsEcran ? 'var(--color-error)' : '' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {idx === 0 && <DotsSixVertical className={styles.dragHandle} size={18} />}
                                                {idx === 0 ? time : ''}
                                                {idx === 0 && totalDuration >= 180 && (
                                                    <div className={styles.infoIcon} title={`Tranche pleine (${totalDuration}s). Il est conseillé de déplacer cette campagne vers la tranche suivante ou précédente (celle avec la durée totale la plus basse).`}>
                                                        <Info size={18} weight="fill" color="var(--color-primary)" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className={styles.tdAnnonceur} style={{ color: isHorsEcran ? 'var(--color-error)' : '' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {entry.annonceur}
                                                {isConcurrence && (
                                                    <div title="Concurrence directe : même catégorie consécutive">
                                                        <Warning size={16} weight="bold" color="var(--color-warning)" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className={styles.tdSpot} style={{ color: isHorsEcran ? 'var(--color-error)' : '' }}>{entry.spot}</td>
                                        <td className={styles.tdDuree}>{entry.duree}s</td>
                                        <td className={styles.tdNumero} style={{ color: isHorsEcran ? 'var(--color-error)' : '' }}>{entry.numero}</td>
                                        <td className={styles.tdActions}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                {idx === 0 && (
                                                    <button
                                                        className={styles.deleteButton}
                                                        onClick={(e) => { e.stopPropagation(); handleAddClick(time); }}
                                                        title="Ajouter une autre campagne"
                                                        style={{ color: 'var(--color-primary)' }}
                                                    >
                                                        <PlusCircle size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(time, idx); }}
                                                    title="Supprimer"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            });
                        })}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {openDialog ? (
                <div className={styles.modalOverlay} onClick={() => setOpenDialog(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                Ajouter une campagne - {selectedTime}
                            </h2>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formControl}>
                                <label className={styles.label}>Annonceur (Client)</label>
                                <input
                                    className={styles.input}
                                    value={form.annonceur}
                                    onChange={(e) => setForm({ ...form, annonceur: e.target.value })}
                                    placeholder="Nom du client"
                                    autoFocus
                                />
                            </div>
                            <div className={styles.formControl}>
                                <label className={styles.label}>Spot (Campagne)</label>
                                <input
                                    className={styles.input}
                                    value={form.spot}
                                    onChange={(e) => setForm({ ...form, spot: e.target.value })}
                                    placeholder="Nom de la campagne"
                                />
                            </div>
                            <div className={styles.formControl}>
                                <label className={styles.label}>Durée</label>
                                <input
                                    className={styles.input}
                                    value={form.duree}
                                    onChange={(e) => setForm({ ...form, duree: e.target.value })}
                                    placeholder="Ex: 30s, 1min"
                                />
                            </div>
                            <div className={styles.formControl}>
                                <label className={styles.label}>Numéro (Spot ID)</label>
                                <input
                                    className={styles.input}
                                    value={form.numero}
                                    onChange={(e) => setForm({ ...form, numero: e.target.value })}
                                    placeholder="Ex: 204044"
                                />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.buttonSecondary} onClick={() => setOpenDialog(false)}>
                                Annuler
                            </button>
                            <button className={styles.button} onClick={handleModalSave}>
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
