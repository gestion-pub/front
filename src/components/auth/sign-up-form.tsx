'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';
import styles from './auth.module.css';

const schema = zod.object({
  firstName: zod.string().min(1, { message: 'First name is required' }),
  lastName: zod.string().min(1, { message: 'Last name is required' }),
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  password: zod.string().min(6, { message: 'Password should be at least 6 characters' }),
  terms: zod.boolean().refine((value) => value, 'You must accept the terms and conditions'),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { firstName: '', lastName: '', email: '', password: '', terms: false } satisfies Values;

export function SignUpForm(): React.JSX.Element {
  const router = useRouter();

  const { checkSession } = useUser();

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

      const { error } = await authClient.signUp(values);

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
        <h4 className={styles.title}>Sign up</h4>
        <p className={styles.subtitle}>
          Already have an account?{' '}
          <RouterLink href={paths.auth.signIn} className={styles.link}>
            Sign in
          </RouterLink>
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.formStack}>
        <Controller
          control={control}
          name="firstName"
          render={({ field }) => (
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.label}>First name</label>
              <input
                {...field}
                id="firstName"
                className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
              />
              {errors.firstName ? <p className={styles.helperText}>{errors.firstName.message}</p> : null}
            </div>
          )}
        />
        <Controller
          control={control}
          name="lastName"
          render={({ field }) => (
            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.label}>Last name</label>
              <input
                {...field}
                id="lastName"
                className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
              />
              {errors.lastName ? <p className={styles.helperText}>{errors.lastName.message}</p> : null}
            </div>
          )}
        />
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
              <input
                {...field}
                id="password"
                type="password"
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              />
              {errors.password ? <p className={styles.helperText}>{errors.password.message}</p> : null}
            </div>
          )}
        />
        <Controller
          control={control}
          name="terms"
          render={({ field }) => (
            <div className={styles.formGroup}>
              <div className={styles.checkboxGroup}>
                <input
                  {...field}
                  id="terms"
                  type="checkbox"
                  checked={field.value}
                  value={undefined} // Checkbox doesn't use value prop the same way
                  className={styles.checkbox}
                />
                <label htmlFor="terms" className={styles.checkboxLabel}>
                  I have read the <RouterLink href="#" className={styles.link}>terms and conditions</RouterLink>
                </label>
              </div>
              {errors.terms ? <p className={styles.helperText}>{errors.terms.message}</p> : null}
            </div>
          )}
        />
        {errors.root ? (
          <div className={`${styles.alert} ${styles.alertError}`}>
            <p className={styles.alertText}>{errors.root.message}</p>
          </div>
        ) : null}
        <button disabled={isPending} type="submit" className={styles.button}>
          Sign up
        </button>
      </form>
      <div className={`${styles.alert} ${styles.alertWarning}`}>
        <p className={styles.alertText}>Created users are not persisted</p>
      </div>
    </div>
  );
}
