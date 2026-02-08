'use client';

import React from 'react';
import { DropdownMenu as RadixDropdownMenu } from 'radix-ui';
import { cn } from '../lib/cn';

/* Cast Radix components to work around React 18/19 type mismatch */
const RadixPortal = RadixDropdownMenu.Portal as unknown as React.FC<{ children?: React.ReactNode }>;
const RadixContent = RadixDropdownMenu.Content as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<'div'> & { sideOffset?: number } & React.RefAttributes<HTMLDivElement>
>;
const RadixItem = RadixDropdownMenu.Item as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<'div'> & React.RefAttributes<HTMLDivElement>
>;
const RadixSeparator = RadixDropdownMenu.Separator as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<'div'> & React.RefAttributes<HTMLDivElement>
>;
const RadixLabel = RadixDropdownMenu.Label as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<'div'> & React.RefAttributes<HTMLDivElement>
>;

const DropdownMenu = RadixDropdownMenu.Root;
const DropdownMenuTrigger = RadixDropdownMenu.Trigger;
const DropdownMenuGroup = RadixDropdownMenu.Group;
const DropdownMenuSub = RadixDropdownMenu.Sub;

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & { sideOffset?: number }
>(({ className, sideOffset = 4, ...props }, ref) => (
  <RadixPortal>
    <RadixContent
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        className,
      )}
      {...props}
    />
  </RadixPortal>
));
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <RadixItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <RadixSeparator ref={ref} className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <RadixLabel
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSub,
};
