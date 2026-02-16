import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';


export const navItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'users', title: 'Users', href: paths.dashboard.users, icon: 'users', permission: 'manage_users' },
  { key: 'categories', title: 'Categories', href: paths.dashboard.categories, icon: 'categories', permission: 'read_category' },
  { key: 'roles', title: 'Roles', href: paths.dashboard.roles, icon: 'roles', permission: 'manage_roles' },
  { key: 'clients', title: 'Clients', href: paths.dashboard.clients, icon: 'clients', permission: 'read_client' },
  { key: 'campagnes', title: 'Campagnes', href: paths.dashboard.campagnes, icon: 'campagnes', permission: 'read_compagne' },
  { key: 'plannings', title: 'Plannings', href: paths.dashboard.plannings, icon: 'planning', permission: 'read_planning' },
  { key: 'conducteurs', title: 'Conducteurs', href: paths.dashboard.conducteurs, icon: 'conducteurs', permission: 'read_conducteur' },

] satisfies NavItemConfig[];
