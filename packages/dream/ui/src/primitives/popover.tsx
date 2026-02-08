'use client';

import React from 'react';
import { Popover as RadixPopover } from 'radix-ui';
import { cn } from '../lib/cn';

/* Cast Radix components to work around React 18/19 type mismatch */
const RadixPortal = RadixPopover.Portal as unknown as React.FC<{ children?: React.ReactNode }>;
const RadixContent = RadixPopover.Content as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<'div'> & { align?: 'start' | 'center' | 'end'; sideOffset?: number } & React.RefAttributes<HTMLDivElement>
>;

const Popover = RadixPopover.Root;
const PopoverTrigger = RadixPopover.Trigger;

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & { align?: 'start' | 'center' | 'end'; sideOffset?: number }
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <RadixPortal>
    <RadixContent
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none',
        className,
      )}
      {...props}
    />
  </RadixPortal>
));
PopoverContent.displayName = 'PopoverContent';

export { Popover, PopoverTrigger, PopoverContent };
