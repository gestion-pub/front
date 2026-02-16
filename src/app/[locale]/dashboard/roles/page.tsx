'use client';

import * as React from 'react';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { Pencil } from '@phosphor-icons/react/dist/ssr/Pencil';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';
import { rolesService } from '@/services/roles.service';
import { permissionsService } from '@/services/permissions.service';
import { PermissionGuard } from '@/components/core/permission-guard';
import type { Role, Permission } from '@/types/api';
import styles from './roles.module.css';

export default function RolesPage(): React.JSX.Element {
    const [roles, setRoles] = React.useState<Role[]>([]);
    const [permissions, setPermissions] = React.useState<Permission[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [form, setForm] = React.useState({
        name: '',
        permissions: [] as number[]
    });
    const [editingRole, setEditingRole] = React.useState<Role | null>(null);
    const [openDialog, setOpenDialog] = React.useState(false);

    /* ===== LOAD DATA ===== */
    const loadRoles = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await rolesService.getAll();
            setRoles(data);
        } catch (error_) {
            setError('Failed to load roles');
            console.error('Error loading roles:', error_);
        } finally {
            setLoading(false);
        }
    };

    const loadPermissions = async () => {
        try {
            const data = await permissionsService.getAll();
            setPermissions(data);
        } catch (error_) {
            console.error('Error loading permissions:', error_);
        }
    };

    React.useEffect(() => {
        loadRoles();
        loadPermissions();
    }, []);

    /* ===== ACTIONS ===== */
    const handleSave = async () => {
        if (!form.name.trim()) return;

        try {
            if (editingRole) {
                await rolesService.update(editingRole.id, form);
            } else {
                await rolesService.create(form);
            }

            await loadRoles();
            setForm({ name: '', permissions: [] });
            setEditingRole(null);
            setOpenDialog(false);
        } catch (error_: any) {
            console.error('Error saving role:', error_);
            const message = error_.response?.data?.message || 'Failed to save role';
            alert(message);
        }
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setForm({
            name: role.name,
            permissions: role.permissions?.map(p => p.id) || []
        });
        setOpenDialog(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) return;

        try {
            await rolesService.delete(id);
            await loadRoles();
        } catch (error_: any) {
            console.error('Error deleting role:', error_);
            const message = error_.response?.data?.message || 'Failed to delete role';
            alert(message);
        }
    };

    const handleAddClick = () => {
        setForm({ name: '', permissions: [] });
        setEditingRole(null);
        setOpenDialog(true);
    };

    const handlePermissionToggle = (permissionId: number) => {
        setForm(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter(id => id !== permissionId)
                : [...prev.permissions, permissionId]
        }));
    };

    /* ===== UI ===== */
    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>Rôles</h1>
                <PermissionGuard permission="manage_roles">
                    <button className={styles.button} onClick={handleAddClick}>
                        <Plus size={20} />
                        Add Role
                    </button>
                </PermissionGuard>
            </div>

            {/* Loading State */}
            {loading && (
                <div className={styles.loadingContainer}>
                    <p>Loading roles...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className={styles.errorContainer}>
                    <p>{error}</p>
                    <button onClick={loadRoles} className={styles.buttonSecondary}>
                        Retry
                    </button>
                </div>
            )}

            {/* Grid List */}
            {!loading && !error && (
                <div className={styles.grid}>
                    {roles.length === 0 && (
                        <div className={styles.emptyState}>
                            <p>Aucun rôle</p>
                        </div>
                    )}

                    {roles.map((role) => (
                        <div key={role.id} className={styles.card}>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{role.name}</h3>
                                <p className={styles.cardSubtitle}>
                                    {role.permissions?.length || 0} permission(s)
                                </p>
                                {role.permissions && role.permissions.length > 0 && (
                                    <div className={styles.permissionsList}>
                                        {role.permissions.map((perm) => (
                                            <span key={perm.id} className={styles.permissionBadge}>
                                                {perm.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className={styles.cardActions}>
                                <PermissionGuard permission="manage_roles">
                                    <button className={styles.iconButton} onClick={() => handleEdit(role)} title="Edit">
                                        <Pencil size={20} />
                                    </button>
                                </PermissionGuard>
                                <PermissionGuard permission="manage_roles">
                                    <button
                                        className={`${styles.iconButton} ${styles.iconButtonError}`}
                                        onClick={() => handleDelete(role.id)}
                                        title="Delete"
                                    >
                                        <Trash size={20} />
                                    </button>
                                </PermissionGuard>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Dialog */}
            {openDialog ? (
                <div className={styles.modalOverlay} onClick={() => setOpenDialog(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                {editingRole ? 'Edit Role' : 'Add Role'}
                            </h2>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formControl}>
                                <label className={styles.label}>Nom du rôle</label>
                                <input
                                    className={styles.input}
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            <div className={styles.formControl}>
                                <label className={styles.label}>Permissions</label>
                                <div className={styles.permissionsGrid}>
                                    {permissions.map((permission) => (
                                        <label key={permission.id} className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={form.permissions.includes(permission.id)}
                                                onChange={() => handlePermissionToggle(permission.id)}
                                                className={styles.checkbox}
                                            />
                                            <span>{permission.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.buttonSecondary} onClick={() => setOpenDialog(false)}>
                                Cancel
                            </button>
                            <button className={styles.button} onClick={handleSave}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
