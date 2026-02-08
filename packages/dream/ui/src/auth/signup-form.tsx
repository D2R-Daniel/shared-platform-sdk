'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../primitives/form';
import { Input } from '../primitives/input';
import { Button } from '../primitives/button';
import { cn } from '../lib/cn';
import type { ReactNode } from 'react';

const signupSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export interface SignupFormSlots {
  beforeFields?: ReactNode;
  afterFields?: ReactNode;
  submitButton?: (props: { isSubmitting: boolean; isValid: boolean }) => ReactNode;
  footer?: ReactNode;
}

export interface SignupFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  invitationToken?: string;
  slots?: SignupFormSlots;
  className?: string;
}

export function SignupForm({
  onSuccess,
  onError,
  invitationToken,
  slots = {},
  className,
}: SignupFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  async function handleSubmit(_data: SignupFormData) {
    setFormError(null);
    try {
      onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign up failed');
      setFormError(error.message);
      onError?.(error);
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {slots.beforeFields}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
          {formError && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {formError}
            </div>
          )}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    readOnly={!!invitationToken}
                    {...field}
                  />
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
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
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
              {form.formState.isSubmitting ? 'Creating account...' : 'Sign up'}
            </Button>
          )}
        </form>
      </Form>

      {slots.footer}
    </div>
  );
}
