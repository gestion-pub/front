'use client';

import apiClient from '@/lib/api-client';
import type { User } from '@/types/user';

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { email, password } = params;

    try {
      const response = await apiClient.post('/login', { email, password });

      // Laravel returns the plain text token directly
      const token = typeof response.data === 'string' ? response.data : response.data.token;

      if (token) {
        localStorage.setItem('auth_token', token);
        return {};
      }

      return { error: 'Failed to retrieve auth token' };
    } catch (err: any) {
      console.error('Login error:', err);
      const message = err.response?.data?.message || 'Invalid credentials';
      return { error: message };
    }
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      return { data: null };
    }

    try {
      const response = await apiClient.get('/user');
      return { data: response.data };
    } catch (err: any) {
      console.error('Get user error:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('auth_token');
      }
      return { data: null, error: 'Session expired' };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    try {
      await apiClient.post('/logout');
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      localStorage.removeItem('auth_token');
    }

    return {};
  }
}

export const authClient = new AuthClient();

