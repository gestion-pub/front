import apiClient from '@/lib/api-client';
import type { Client, CreateClientRequest, UpdateClientRequest } from '@/types/api';

export const clientsService = {
    // Get all clients
    async getAll(): Promise<Client[]> {
        const response = await apiClient.get<Client[]>('/clients');
        return response.data;
    },

    // Get single client by ID
    async getById(id: number): Promise<Client> {
        const response = await apiClient.get<Client>(`/clients/${id}`);
        return response.data;
    },

    // Create new client
    async create(data: CreateClientRequest): Promise<Client> {
        const response = await apiClient.post<Client>('/clients', data);
        return response.data;
    },

    // Update existing client
    async update(id: number, data: UpdateClientRequest): Promise<Client> {
        const response = await apiClient.put<Client>(`/clients/${id}`, data);
        return response.data;
    },

    // Delete client
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/clients/${id}`);
    },
};
