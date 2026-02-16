import apiClient from '@/lib/api-client';
import type { Permission } from '@/types/api';

export const permissionsService = {
    // Get all available permissions
    async getAll(): Promise<Permission[]> {
        const response = await apiClient.get<Permission[]>('/permissions');
        return response.data;
    },

    // Get single permission by ID
    async getById(id: number): Promise<Permission> {
        const response = await apiClient.get<Permission>(`/permissions/${id}`);
        return response.data;
    },
};
