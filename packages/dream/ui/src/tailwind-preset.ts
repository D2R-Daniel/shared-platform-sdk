// tailwind-preset.ts — Tailwind v3.4 JS preset
// Usage: const { dreamPreset } = require('@dream/ui/tailwind');
// Then add to tailwind.config.js: presets: [dreamPreset]

export const dreamPreset = {
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--dream-color-background) / <alpha-value>)',
        foreground: 'hsl(var(--dream-color-foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'hsl(var(--dream-color-card) / <alpha-value>)',
          foreground: 'hsl(var(--dream-color-card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--dream-color-popover) / <alpha-value>)',
          foreground: 'hsl(var(--dream-color-popover-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'hsl(var(--dream-color-primary) / <alpha-value>)',
          foreground: 'hsl(var(--dream-color-primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--dream-color-secondary) / <alpha-value>)',
          foreground: 'hsl(var(--dream-color-secondary-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--dream-color-accent) / <alpha-value>)',
          foreground: 'hsl(var(--dream-color-accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--dream-color-destructive) / <alpha-value>)',
          foreground: 'hsl(var(--dream-color-destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--dream-color-muted) / <alpha-value>)',
          foreground: 'hsl(var(--dream-color-muted-foreground) / <alpha-value>)',
        },
        border: 'hsl(var(--dream-color-border) / <alpha-value>)',
        input: 'hsl(var(--dream-color-input) / <alpha-value>)',
        ring: 'hsl(var(--dream-color-ring) / <alpha-value>)',
      },
      borderRadius: {
        sm: 'var(--dream-radius-sm)',
        md: 'var(--dream-radius-md)',
        lg: 'var(--dream-radius-lg)',
        xl: 'var(--dream-radius-xl)',
      },
      fontFamily: {
        sans: ['var(--dream-font-sans)'],
        mono: ['var(--dream-font-mono)'],
      },
    },
  },
} as const;

export default dreamPreset;
