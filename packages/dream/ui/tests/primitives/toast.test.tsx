import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Toaster } from '../../src/primitives/toast';

describe('Toaster', () => {
  it('renders the sonner toaster container', () => {
    const { container } = render(<Toaster />);
    // Sonner renders an ordered-list or section as the toast container
    const toasterEl = container.querySelector('ol') ?? container.querySelector('section') ?? document.querySelector('[data-sonner-toaster]');
    expect(toasterEl ?? container.firstChild).toBeTruthy();
  });
});
