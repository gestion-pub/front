import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';


export const navItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'users', title: 'Users', href: paths.dashboard.users, icon: 'users' },
  { key: 'categories', title: 'Categories', href: paths.dashboard.categories, icon: 'categories' },
  { key: 'clients', title: 'Clients', href: paths.dashboard.clients, icon: 'clients' },
  { key: 'campagnes', title: 'Campagnes', href: paths.dashboard.campagnes, icon: 'campagnes' },
  { key: 'plannings', title: 'Plannings', href: paths.dashboard.plannings, icon: 'planning' },
  { key: 'conducteurs', title: 'Conducteurs', href: paths.dashboard.conducteurs, icon: 'conducteurs' },
  { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
  { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
] satisfies NavItemConfig[];
