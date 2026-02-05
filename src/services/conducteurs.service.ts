import apiClient from '@/lib/api-client';
import type { Conducteur, CreateConducteurRequest, UpdateConducteurRequest } from '@/types/conducteur';

export const conducteursService = {
    // Get all conducteurs
    async getAll(): Promise<Conducteur[]> {
        const response = await apiClient.get<Conducteur[]>('/conducteurs');
        return response.data;
    },

    // Get single conducteur by ID
    async getById(id: number): Promise<Conducteur> {
        const response = await apiClient.get<Conducteur>(`/conducteurs/${id}`);
        return response.data;
    },

    // Create new conducteur
    async create(data: CreateConducteurRequest): Promise<Conducteur> {
        const response = await apiClient.post<Conducteur>('/conducteurs', data);
        return response.data;
    },

    // Update existing conducteur
    async update(id: number, data: UpdateConducteurRequest): Promise<Conducteur> {
        const response = await apiClient.put<Conducteur>(`/conducteurs/${id}`, data);
        return response.data;
    },

    // Delete conducteur
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/conducteurs/${id}`);
    },

    // Export conducteur (placeholder for now)
    async export(id: number): Promise<Blob> {
        const response = await apiClient.get(`/conducteurs/${id}/export`, {
            responseType: 'blob'
        });
        return response.data;
    }
};
