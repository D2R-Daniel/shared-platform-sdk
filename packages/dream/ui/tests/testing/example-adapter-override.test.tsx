import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../src/testing';
import { useDreamUI } from '../../src/theme/use-dream-ui';
import React, { useEffect, useState } from 'react';

function MemberCount() {
  const { apiAdapter } = useDreamUI();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    apiAdapter.listMembers({ page: 1, pageSize: 10 }).then((res: any) => {
      setCount(res?.total ?? 0);
    });
  }, [apiAdapter]);

  return <span data-testid="count">{count === null ? 'loading' : count}</span>;
}

describe('Example: adapter override in tests', () => {
  it('renders with custom adapter returning specific data', async () => {
    const customAdapter = {
      listMembers: vi.fn().mockResolvedValue({ data: [{ id: '1' }, { id: '2' }], total: 2 }),
    };

    renderWithProviders(<MemberCount />, { adapter: customAdapter });

    await screen.findByText('2');
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(customAdapter.listMembers).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
  });

  it('renders with default noop adapter returning empty', async () => {
    renderWithProviders(<MemberCount />);

    // Noop adapter returns {} which has no .total, so count becomes 0
    await screen.findByText('0');
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
});
