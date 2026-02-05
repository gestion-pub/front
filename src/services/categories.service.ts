import apiClient from '@/lib/api-client';
import type { Categorie, CreateCategorieRequest, UpdateCategorieRequest } from '@/types/api';

export const categoriesService = {
    // Get all categories
    async getAll(): Promise<Categorie[]> {
        const response = await apiClient.get<Categorie[]>('/categories');
        return response.data;
    },

    // Get single category by ID
    async getById(id: number): Promise<Categorie> {
        const response = await apiClient.get<Categorie>(`/categories/${id}`);
        return response.data;
    },

    // Create new category
    async create(data: CreateCategorieRequest): Promise<Categorie> {
        const response = await apiClient.post<Categorie>('/categories', data);
        return response.data;
    },

    // Update existing category
    async update(id: number, data: UpdateCategorieRequest): Promise<Categorie> {
        const response = await apiClient.put<Categorie>(`/categories/${id}`, data);
        return response.data;
    },

    // Delete category
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/categories/${id}`);
    },
};
