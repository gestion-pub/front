'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { planningsService } from '@/services/plannings.service';
import { campagnesService } from '@/services/campagnes.service';
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

export default function PlanningDetailPage(): React.JSX.Element {
    const params = useParams();
    const router = useRouter();
    const campaignId = Number(params.id);

    const [campaign, setCampaign] = React.useState<Campagne | null>(null);
    const [plannings, setPlannings] = React.useState<PlanningEntry[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [currentStatus, setCurrentStatus] = React.useState<'réservé' | 'programmé'>('réservé');

    const loadData = async () => {
        try {
            const [campagnesData, planningsData] = await Promise.all([
                campagnesService.getAll(),
                planningsService.getAll()
            ]);

            const foundCampaign = campagnesData.find((c: Campagne) => c.id === campaignId);
            setCampaign(foundCampaign || null);

            const campaignPlannings = planningsData.data.filter(
                (p: any) => p.id_campagne === campaignId
            );
            setPlannings(campaignPlannings);

            // Determine overall status (if any planning is programmé, show programmé)
            const hasProgammed = campaignPlannings.some((p: any) => p.status === 'programmé');
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

    // Generate time slots (7:00 - 19:00 in 15-minute intervals)
    const generateTimeSlots = () => {
        const slots: string[] = [];
        for (let hour = 7; hour < 19; hour++) {
            for (let min = 0; min < 60; min += 15) {
                const h = hour.toString().padStart(2, '0');
                const m = min.toString().padStart(2, '0');
                slots.push(`${h}:${m}`);
            }
        }
        return slots;
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

    const formatDate = (date: Date) => {
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const day = days[date.getDay()];
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day} ${d}/${m}`;
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
        </div>
    );
}
