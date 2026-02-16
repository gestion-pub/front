'use client';

import * as React from 'react';
import { useUser } from '@/hooks/use-user';

export interface PermissionGuardProps {
    children: React.ReactNode;
    permission: string;
}

/**
 * PermissionGuard component to conditionally render children based on user permissions.
 *
 * @param permission - The slug of the required permission.
 * @returns Children if the user has the permission, null otherwise.
 */
export function PermissionGuard({ children, permission }: PermissionGuardProps): React.JSX.Element | null {
    const { user } = useUser();

    // If user is not loaded or doesn't have permissions array, don't show anything
    if (!user || !user.permissions) {
        return null;
    }

    // Check if user has the specific permission
    const hasPermission = user.permissions.includes(permission);

    if (!hasPermission) {
        return null;
    }

    return <>{children}</>;
}
