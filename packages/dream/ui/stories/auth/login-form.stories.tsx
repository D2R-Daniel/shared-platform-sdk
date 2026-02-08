import type { Meta, StoryObj } from '@storybook/react';
import { LoginForm } from '../../src/auth/login-form';
import { AuthLayout } from '../../src/auth/auth-layout';

const meta = {
  title: 'Auth/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <AuthLayout title="Sign In" description="Enter your credentials to continue">
        <Story />
      </AuthLayout>
    ),
  ],
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithGoogle: Story = {
  args: {
    providers: ['credentials', 'google'],
  },
};

export const WithAllProviders: Story = {
  args: {
    providers: ['credentials', 'google', 'azure-entra'],
  },
};

export const WithSlots: Story = {
  args: {
    slots: {
      afterFields: (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" />
          Remember me
        </label>
      ),
      footer: (
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <a href="/signup" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      ),
    },
  },
};

export const WithClassName: Story = {
  args: {
    className: 'max-w-sm',
  },
};
