'use client';

import React from 'react';
import { Tabs as RadixTabs } from 'radix-ui';
import { cn } from '../lib/cn';

/* Cast Radix components to work around React 18/19 type mismatch */
const RadixList = RadixTabs.List as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<'div'> & React.RefAttributes<HTMLDivElement>
>;
const RadixTrigger = RadixTabs.Trigger as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<'button'> & { value: string } & React.RefAttributes<HTMLButtonElement>
>;
const RadixContent = RadixTabs.Content as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<'div'> & { value: string } & React.RefAttributes<HTMLDivElement>
>;

const Tabs = RadixTabs.Root;

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <RadixList
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'> & { value: string }
>(({ className, ...props }, ref) => (
  <RadixTrigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & { value: string }
>(({ className, ...props }, ref) => (
  <RadixContent
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
