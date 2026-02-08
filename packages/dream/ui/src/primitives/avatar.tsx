import React from 'react';
import { Avatar as RadixAvatar } from 'radix-ui';
import { cn } from '../lib/cn';

/* Cast Radix components to work around React 18/19 type mismatch */
const RadixRoot = RadixAvatar.Root as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<'span'> & React.RefAttributes<HTMLSpanElement>
>;
const RadixImage = RadixAvatar.Image as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<'img'> & React.RefAttributes<HTMLImageElement>
>;
const RadixFallback = RadixAvatar.Fallback as unknown as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<'span'> & React.RefAttributes<HTMLSpanElement>
>;

const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<'span'>
>(({ className, ...props }, ref) => (
  <RadixRoot
    ref={ref}
    className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
    {...props}
  />
));
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ComponentPropsWithoutRef<'img'>
>(({ className, ...props }, ref) => (
  <RadixImage ref={ref} className={cn('aspect-square h-full w-full', className)} {...props} />
));
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<'span'>
>(({ className, ...props }, ref) => (
  <RadixFallback
    ref={ref}
    className={cn('flex h-full w-full items-center justify-center rounded-full bg-muted', className)}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
