export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    users: '/dashboard/users',
    plannings: '/dashboard/plannings',
    clients: '/dashboard/clients',
    categories: '/dashboard/categories',
    roles: '/dashboard/roles',
    conducteurs: '/dashboard/conducteurs',
    campagnes: '/dashboard/campagnes',
    settings: '/dashboard/settings',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
