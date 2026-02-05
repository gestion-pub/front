import apiClient from '@/lib/api-client';
import type { User } from '@/types/api';

export const usersService = {
    // Get all users
    async getAll(): Promise<User[]> {
        const response = await apiClient.get<User[]>('/users');
        return response.data;
    },

    // Get current authenticated user
    async getCurrentUser(): Promise<User> {
        const response = await apiClient.get<User>('/user');
        return response.data;
    },

    // Create user
    async create(data: Partial<User>): Promise<User> {
        const response = await apiClient.post<User>('/users', data);
        return response.data;
    },

    // Update user
    async update(id: number, data: Partial<User>): Promise<User> {
        const response = await apiClient.put<User>(`/users/${id}`, data);
        return response.data;
    },

    // Delete user
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/users/${id}`);
    },
};
