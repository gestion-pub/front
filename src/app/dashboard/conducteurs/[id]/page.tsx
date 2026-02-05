'use client';

import * as React from 'react';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { FloppyDisk } from '@phosphor-icons/react/dist/ssr/FloppyDisk';
import { DownloadSimple } from '@phosphor-icons/react/dist/ssr/DownloadSimple';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { conducteursService } from '@/services/conducteurs.service';
import { planningsService } from '@/services/plannings.service';
import styles from './conducteurs.module.css';

/* ================= TYPES ================= */

interface ScheduleEntry {
    time: string;
    annonceur: string;
    spot: string;
    duree: string;
    numero: string;
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
    const [schedule, setSchedule] = React.useState<Map<string, ScheduleEntry>>(new Map());
    const [openDialog, setOpenDialog] = React.useState(false);
    const [selectedTime, setSelectedTime] = React.useState<string>('');
    const [form, setForm] = React.useState<ScheduleEntry>({
        time: '',
        annonceur: '',
        spot: '',
        duree: '',
        numero: '',
    });

    const [timeSlots, setTimeSlots] = React.useState<string[]>(() => generateTimeSlots());

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

                    // Fetch plannings for this date
                    try {
                        const planningsResponse = await planningsService.getAll();
                        const dateStr = data.date; // Format: YYYY-MM-DD

                        console.log('=== CONDUCTEUR DEBUG ===');
                        console.log('Conducteur date:', dateStr);
                        console.log('All plannings:', planningsResponse.data);

                        // Filter plannings for this specific date AND status = 'programmé'
                        const datePlannings = planningsResponse.data.filter(
                            (p: any) => p.date === dateStr && p.status === 'programmé'
                        );

                        console.log('Filtered programmé plannings:', datePlannings);

                        // Convert plannings to schedule entries
                        const scheduleMap = new Map<string, ScheduleEntry>();
                        datePlannings.forEach((planning: any) => {
                            // Remove seconds from time (13:30:00 -> 13:30)
                            const timeWithoutSeconds = planning.heure.substring(0, 5);

                            scheduleMap.set(timeWithoutSeconds, {
                                time: timeWithoutSeconds,
                                annonceur: planning.spot || '', // Campaign name
                                spot: planning.spot || '',
                                duree: String(planning.duree || ''),
                                numero: String(planning.campagne?.spot_id || ''), // Get spot_id from campagne relation
                            });
                        });

                        console.log('Schedule map:', scheduleMap);

                        setSchedule(scheduleMap);
                    } catch (planningError) {
                        console.error('Failed to load plannings:', planningError);
                    }
                }

                // Load schedule from conducteur slots if exists (this will override planning data if present)
                if (data.slots && Array.isArray(data.slots) && data.slots.length > 0) {
                    const scheduleMap = new Map<string, ScheduleEntry>();
                    data.slots.forEach((slot: any) => {
                        scheduleMap.set(slot.time, slot);
                    });
                    setSchedule(scheduleMap);
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

    const handleAddClick = (time: string) => {
        const existing = schedule.get(time);
        setSelectedTime(time);
        setForm(existing || {
            time,
            annonceur: '',
            spot: '',
            duree: '',
            numero: '',
        });
        setOpenDialog(true);
    };

    const handleModalSave = () => {
        if (!form.annonceur.trim() || !form.spot.trim()) return;

        const newSchedule = new Map(schedule);
        newSchedule.set(selectedTime, form);
        setSchedule(newSchedule);
        setOpenDialog(false);
    };

    const handleGlobalSave = () => {
        console.log('Saving schedule...', Object.fromEntries(schedule));
        alert('Sauvegardé avec succès !');
    };

    const handleExport = () => {
        console.log('Exporting schedule...');
        alert('Export lancé !');
    };

    const handleDelete = (time: string) => {
        if (confirm('Supprimer cette entrée ?')) {
            const newSchedule = new Map(schedule);
            newSchedule.delete(time);
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
                    <button className={styles.saveButton} onClick={handleGlobalSave}>
                        <FloppyDisk size={18} style={{ marginRight: '8px' }} />
                        Sauvegarder
                    </button>
                    <button className={styles.buttonSecondary} onClick={handleExport}>
                        <DownloadSimple size={18} style={{ marginRight: '8px' }} />
                        Export
                    </button>
                    <button
                        className={styles.buttonSecondary}
                        style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                        onClick={handleGlobalDelete}
                    >
                        <Trash size={18} style={{ marginRight: '8px' }} />
                        Supprimer
                    </button>
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
                            const entry = schedule.get(time);
                            return (
                                <tr key={time} className={entry ? styles.rowFilled : styles.rowEmpty}>
                                    <td className={styles.tdTime}>{time}</td>
                                    <td className={styles.tdAnnonceur}>{entry?.annonceur || ''}</td>
                                    <td className={styles.tdSpot}>{entry?.spot || ''}</td>
                                    <td className={styles.tdDuree}>{entry?.duree || ''}</td>
                                    <td className={styles.tdNumero}>{entry?.numero || ''}</td>
                                    <td className={styles.tdActions}>
                                        {entry ? (
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => handleDelete(time)}
                                                title="Supprimer"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        ) : (
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => handleRemoveSlot(time)}
                                                title="Masquer l'horaire"
                                                style={{ opacity: 0.5 }}
                                            >
                                                <Trash size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
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
