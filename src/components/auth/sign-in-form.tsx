'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';
import styles from './auth.module.css';

const schema = zod.object({
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  password: zod.string().min(1, { message: 'Password is required' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { email: '', password: '' } satisfies Values;

export function SignInForm(): React.JSX.Element {
  const router = useRouter();

  const { checkSession } = useUser();

  const [showPassword, setShowPassword] = React.useState<boolean>();

  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const { error } = await authClient.signInWithPassword(values);

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      // Refresh the auth state
      await checkSession?.();

      // UserProvider, for this case, will not refresh the router
      // After refresh, GuestGuard will handle the redirect
      router.refresh();
    },
    [checkSession, router, setError]
  );

  return (
    <div className={styles.stack}>
      <div className={styles.header}>
        <h4 className={styles.title}>Sign in</h4>
        <p className={styles.subtitle}>
          Don&apos;t have an account?{' '}
          <RouterLink href={paths.auth.signUp} className={styles.link}>
            Sign up
          </RouterLink>
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.formStack}>
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email address</label>
              <input
                {...field}
                id="email"
                type="email"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              />
              {errors.email ? <p className={styles.helperText}>{errors.email.message}</p> : null}
            </div>
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <input
                  {...field}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                />
                <div
                  className={styles.inputIcon}
                  onClick={() => setShowPassword(!showPassword)}
                  role="button"
                  tabIndex={0}
                >
                  {showPassword ? (
                    <EyeIcon fontSize="1.25rem" />
                  ) : (
                    <EyeSlashIcon fontSize="1.25rem" />
                  )}
                </div>
              </div>
              {errors.password ? <p className={styles.helperText}>{errors.password.message}</p> : null}
            </div>
          )}
        />
        <div>
          <RouterLink href={paths.auth.resetPassword} className={styles.link} style={{ fontSize: '0.875rem' }}>
            Forgot password?
          </RouterLink>
        </div>
        {errors.root ? (
          <div className={`${styles.alert} ${styles.alertError}`}>
            <p className={styles.alertText}>{errors.root.message}</p>
          </div>
        ) : null}
        <button disabled={isPending} type="submit" className={styles.button}>
          Sign in
        </button>
      </form>
      <div className={`${styles.alert} ${styles.alertWarning}`}>
        <p className={styles.alertText}>
          Enter your credentials to continue.
        </p>
      </div>
    </div>
  );
}
