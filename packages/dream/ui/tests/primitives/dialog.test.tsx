import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
  DialogPortal,
} from '../../src/primitives/dialog';

describe('Dialog', () => {
  it('exports all dialog parts', () => {
    expect(Dialog).toBeDefined();
    expect(DialogTrigger).toBeDefined();
    expect(DialogContent).toBeDefined();
    expect(DialogHeader).toBeDefined();
    expect(DialogFooter).toBeDefined();
    expect(DialogTitle).toBeDefined();
    expect(DialogDescription).toBeDefined();
    expect(DialogClose).toBeDefined();
    expect(DialogOverlay).toBeDefined();
    expect(DialogPortal).toBeDefined();
  });

  it('renders DialogHeader with content', () => {
    render(
      <DialogHeader>
        <h3>Test Title</h3>
        <p>Test Description</p>
      </DialogHeader>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders DialogFooter', () => {
    render(<DialogFooter>Footer content</DialogFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('applies className to DialogHeader', () => {
    const { container } = render(<DialogHeader className="custom">Header</DialogHeader>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders trigger element', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
      </Dialog>
    );
    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
  });
});
