import apiClient from '@/lib/api-client';
import type { Campagne, CreateCampagneRequest, UpdateCampagneRequest, CampagneQueryParams } from '@/types/api';

export const campagnesService = {
    // Get all campagnes with optional filters
    async getAll(params?: CampagneQueryParams): Promise<Campagne[]> {
        const response = await apiClient.get<Campagne[]>('/campagnes', { params });
        return response.data;
    },

    // Get single campagne by ID
    async getById(id: number): Promise<Campagne> {
        const response = await apiClient.get<Campagne>(`/campagnes/${id}`);
        return response.data;
    },

    // Create new campagne
    async create(data: CreateCampagneRequest): Promise<Campagne> {
        const response = await apiClient.post<Campagne>('/campagnes', data);
        return response.data;
    },

    // Update existing campagne
    async update(id: number, data: UpdateCampagneRequest): Promise<Campagne> {
        const response = await apiClient.put<Campagne>(`/campagnes/${id}`, data);
        return response.data;
    },

    // Delete campagne
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/campagnes/${id}`);
    },
};
