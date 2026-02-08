'use client';

import React from 'react';
import { Select as RadixSelect } from 'radix-ui';
import { cn } from '../lib/cn';

/* Cast Radix components to work around React 18/19 type mismatch */
const RadixPortal = RadixSelect.Portal as unknown as React.FC<{ children?: React.ReactNode }>;
const RadixTrigger = RadixSelect.Trigger as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<'button'> & React.RefAttributes<HTMLButtonElement>
>;
const RadixIcon = RadixSelect.Icon as unknown as React.FC<{ asChild?: boolean; children?: React.ReactNode }>;
const RadixContentInner = RadixSelect.Content as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<'div'> & { position?: 'popper' | 'item-aligned' } & React.RefAttributes<HTMLDivElement>
>;
const RadixViewport = RadixSelect.Viewport as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<'div'> & React.RefAttributes<HTMLDivElement>
>;
const RadixItem = RadixSelect.Item as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<'div'> & { value: string } & React.RefAttributes<HTMLDivElement>
>;
const RadixItemIndicator = RadixSelect.ItemIndicator as unknown as React.FC<{ children?: React.ReactNode }>;
const RadixItemText = RadixSelect.ItemText as unknown as React.FC<{ children?: React.ReactNode }>;
const RadixLabel = RadixSelect.Label as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<'div'> & React.RefAttributes<HTMLDivElement>
>;
const RadixSeparator = RadixSelect.Separator as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<'div'> & React.RefAttributes<HTMLDivElement>
>;

const Select = RadixSelect.Root;
const SelectGroup = RadixSelect.Group;
const SelectValue = RadixSelect.Value;

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'>
>(({ className, children, ...props }, ref) => (
  <RadixTrigger
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      className,
    )}
    {...props}
  >
    {children}
    <RadixIcon asChild>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6" /></svg>
    </RadixIcon>
  </RadixTrigger>
));
SelectTrigger.displayName = 'SelectTrigger';

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & { position?: 'popper' | 'item-aligned' }
>(({ className, children, position = 'popper', ...props }, ref) => (
  <RadixPortal>
    <RadixContentInner
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
        position === 'popper' && 'translate-y-1',
        className,
      )}
      position={position}
      {...props}
    >
      <RadixViewport
        className={cn(
          'p-1',
          position === 'popper' && 'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
        )}
      >
        {children}
      </RadixViewport>
    </RadixContentInner>
  </RadixPortal>
));
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & { value: string }
>(({ className, children, ...props }, ref) => (
  <RadixItem
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <RadixItemIndicator>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M20 6 9 17l-5-5" /></svg>
      </RadixItemIndicator>
    </span>
    <RadixItemText>{children}</RadixItemText>
  </RadixItem>
));
SelectItem.displayName = 'SelectItem';

const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <RadixLabel ref={ref} className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)} {...props} />
));
SelectLabel.displayName = 'SelectLabel';

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <RadixSeparator ref={ref} className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
));
SelectSeparator.displayName = 'SelectSeparator';

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem, SelectLabel, SelectSeparator };
