import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockApiProvider } from '../../src/testing/mock-api-provider';
import { useDreamUI } from '../../src/theme/use-dream-ui';

function AdapterConsumer() {
  const { apiAdapter } = useDreamUI();
  return (
    <div>
      <span data-testid="has-listMembers">{typeof apiAdapter.listMembers === 'function' ? 'yes' : 'no'}</span>
      <span data-testid="has-createInvitation">{typeof apiAdapter.createInvitation === 'function' ? 'yes' : 'no'}</span>
      <span data-testid="has-listRoles">{typeof apiAdapter.listRoles === 'function' ? 'yes' : 'no'}</span>
    </div>
  );
}

describe('MockApiProvider', () => {
  it('provides noop adapter with all methods', () => {
    render(
      <MockApiProvider>
        <AdapterConsumer />
      </MockApiProvider>
    );
    expect(screen.getByTestId('has-listMembers')).toHaveTextContent('yes');
    expect(screen.getByTestId('has-createInvitation')).toHaveTextContent('yes');
    expect(screen.getByTestId('has-listRoles')).toHaveTextContent('yes');
  });

  it('allows partial adapter overrides', async () => {
    const customListMembers = vi.fn().mockResolvedValue({ data: [{ id: '1' }], total: 1 });

    function OverrideConsumer() {
      const { apiAdapter } = useDreamUI();
      return (
        <button onClick={() => apiAdapter.listMembers({ page: 1 })}>
          Load
        </button>
      );
    }

    render(
      <MockApiProvider adapter={{ listMembers: customListMembers }}>
        <OverrideConsumer />
      </MockApiProvider>
    );

    await userEvent.click(screen.getByText('Load'));
    expect(customListMembers).toHaveBeenCalledWith({ page: 1 });
  });
});
