'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { authClient } from '@/lib/auth/client';
import styles from './auth.module.css';

const schema = zod.object({ email: zod.string().min(1, { message: 'Email is required' }).email() });

type Values = zod.infer<typeof schema>;

const defaultValues = { email: '' } satisfies Values;

export function ResetPasswordForm(): React.JSX.Element {
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

      const { error } = await authClient.resetPassword(values);

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      setIsPending(false);

      // Redirect to confirm password reset
    },
    [setError]
  );

  return (
    <div className={styles.stack}>
      <div className={styles.header}>
        <h4 className={styles.title}>Reset password</h4>
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
        {errors.root ? (
          <div className={`${styles.alert} ${styles.alertError}`}>
            <p className={styles.alertText}>{errors.root.message}</p>
          </div>
        ) : null}
        <button disabled={isPending} type="submit" className={styles.button}>
          Send recovery link
        </button>
      </form>
    </div>
  );
}
