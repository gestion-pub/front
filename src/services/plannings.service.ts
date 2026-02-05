import api from '@/lib/api-client';

export type PlanningInput = {
    date: string;
    heure: string;
    spot: string;
    duree: number;
    prix_HT: number;
    id_campagne: number;
    status?: 'réservé' | 'programmé';
};

export const planningsService = {
    getAll: async () => {
        const response = await api.get('/plannings');
        return response.data;
    },

    create: async (data: PlanningInput) => {
        const response = await api.post('/plannings', data);
        return response.data;
    },

    update: async (id: number, data: Partial<PlanningInput>) => {
        const response = await api.put(`/plannings/${id}`, data);
        return response.data;
    },

    updateStatus: async (id: number, status: 'réservé' | 'programmé') => {
        const response = await api.put(`/plannings/${id}`, { status });
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/plannings/${id}`);
        return response.data;
    },
};
