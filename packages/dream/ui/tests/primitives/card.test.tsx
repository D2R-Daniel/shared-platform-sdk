import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../src/primitives/card';
import { Separator } from '../../src/primitives/separator';
import { Badge } from '../../src/primitives/badge';
import { Skeleton } from '../../src/primitives/skeleton';
import { Avatar, AvatarFallback } from '../../src/primitives/avatar';

describe('Card', () => {
  it('renders card with all sections', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('accepts className', () => {
    render(<Card className="custom" data-testid="card">Test</Card>);
    expect(screen.getByTestId('card')).toHaveClass('custom');
  });
});

describe('Separator', () => {
  it('renders a separator', () => {
    render(<Separator data-testid="sep" />);
    expect(screen.getByTestId('sep')).toBeInTheDocument();
  });
});

describe('Badge', () => {
  it('renders badge text', () => {
    render(<Badge>Admin</Badge>);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders variant styles', () => {
    render(<Badge variant="destructive">Error</Badge>);
    expect(screen.getByText('Error').className).toContain('destructive');
  });
});

describe('Skeleton', () => {
  it('renders a skeleton element', () => {
    render(<Skeleton data-testid="skel" className="h-4 w-20" />);
    expect(screen.getByTestId('skel')).toHaveClass('animate-pulse');
  });
});

describe('Avatar', () => {
  it('renders fallback when no image', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});
