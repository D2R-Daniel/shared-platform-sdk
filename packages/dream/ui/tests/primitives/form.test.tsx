import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../../src/primitives/form';
import { Input } from '../../src/primitives/input';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

function TestForm({ onSubmit }: { onSubmit?: (data: z.infer<typeof schema>) => void }) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit ?? (() => {}))}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

describe('Form', () => {
  it('renders form with label and input', () => {
    render(<TestForm />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    render(<TestForm />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'not-an-email');
    await userEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });

  it('calls onSubmit with valid data', async () => {
    const onSubmit = vi.fn();
    render(<TestForm onSubmit={onSubmit} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test@example.com');
    await userEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { email: 'test@example.com' },
        expect.anything(),
      );
    });
  });
});
