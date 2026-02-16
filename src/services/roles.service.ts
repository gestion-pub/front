import apiClient from '@/lib/api-client';
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '@/types/api';

export const rolesService = {
    // Get all roles with their permissions
    async getAll(): Promise<Role[]> {
        const response = await apiClient.get<Role[]>('/roles');
        return response.data;
    },

    // Get single role by ID
    async getById(id: number): Promise<Role> {
        const response = await apiClient.get<Role>(`/roles/${id}`);
        return response.data;
    },

    // Create new role with permissions
    async create(data: CreateRoleRequest): Promise<Role> {
        const response = await apiClient.post<Role>('/roles', {
            name: data.name,
            slug: data.name.toLowerCase().replace(/\s+/g, '_'),
            permissions: data.permissions
        });
        return response.data;
    },

    // Update existing role and its permissions
    async update(id: number, data: UpdateRoleRequest): Promise<Role> {
        const response = await apiClient.put<Role>(`/roles/${id}`, {
            name: data.name,
            slug: data.name ? data.name.toLowerCase().replace(/\s+/g, '_') : undefined,
            permissions: data.permissions
        });
        return response.data;
    },

    // Delete role
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/roles/${id}`);
    },

    // Attach permissions to a role
    async attachPermissions(roleId: number, permissionIds: number[]): Promise<void> {
        await apiClient.post(`/roles/${roleId}/permissions`, {
            permissions: permissionIds
        });
    },
};
