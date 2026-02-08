'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../primitives/form';
import { Input } from '../primitives/input';
import { Button } from '../primitives/button';
import { Separator } from '../primitives/separator';
import { SocialLoginButtons } from './social-login-buttons';
import { cn } from '../lib/cn';
import type { ReactNode } from 'react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export interface LoginFormSlots {
  beforeFields?: ReactNode;
  afterFields?: ReactNode;
  submitButton?: (props: { isSubmitting: boolean; isValid: boolean }) => ReactNode;
  footer?: ReactNode;
  divider?: ReactNode;
}

export interface LoginFormProps {
  providers?: Array<'credentials' | 'google' | 'azure-entra' | 'generic-oidc'>;
  onSuccess?: (data: LoginFormData) => void;
  onError?: (error: Error) => void;
  callbackUrl?: string;
  slots?: LoginFormSlots;
  className?: string;
}

export function LoginForm({
  providers = ['credentials'],
  onSuccess,
  onError,
  callbackUrl,
  slots = {},
  className,
}: LoginFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const showCredentials = providers.includes('credentials');
  const socialProviders = providers.filter(
    (p): p is 'google' | 'azure-entra' | 'generic-oidc' => p !== 'credentials',
  );

  async function handleSubmit(data: LoginFormData) {
    setFormError(null);
    try {
      onSuccess?.(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign in failed');
      setFormError(error.message);
      onError?.(error);
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {slots.beforeFields}

      {showCredentials && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
            {formError && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="name@example.com" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {slots.afterFields}
            {slots.submitButton ? (
              slots.submitButton({
                isSubmitting: form.formState.isSubmitting,
                isValid: form.formState.isValid,
              })
            ) : (
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            )}
          </form>
        </Form>
      )}

      {showCredentials && socialProviders.length > 0 && (
        slots.divider ?? (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>
        )
      )}

      {socialProviders.length > 0 && (
        <SocialLoginButtons providers={socialProviders} callbackUrl={callbackUrl} />
      )}

      {slots.footer}
    </div>
  );
}
