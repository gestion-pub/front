export interface User {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
  phone?: string;
  permissions?: string[];
  [key: string]: unknown;
}
