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
          50: '#E8EDF3',
          100: '#D1DBE7',
          200: '#A3B7CF',
          300: '#7593B7',
          400: '#476F9F',
          500: '#1E3A5F',
          600: '#182E4C',
          700: '#122339',
          800: '#0C1726',
          900: '#060C13',
        },
        secondary: {
          DEFAULT: 'hsl(var(--dream-color-secondary) / <alpha-value>)',
          foreground: 'hsl(var(--dream-color-secondary-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--dream-color-accent) / <alpha-value>)',
          foreground: 'hsl(var(--dream-color-accent-foreground) / <alpha-value>)',
          50: '#E0F5FE',
          100: '#BAE8FD',
          200: '#7DD4FB',
          300: '#40C0F9',
          400: '#0EA5E9',
          500: '#0284C7',
          600: '#0369A1',
          700: '#075985',
          800: '#0C4A6E',
          900: '#164E63',
        },
        destructive: {
          DEFAULT: 'hsl(var(--dream-color-destructive) / <alpha-value>)',
          foreground: 'hsl(var(--dream-color-destructive-foreground) / <alpha-value>)',
        },
        success: {
          DEFAULT: '#22C55E',
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          500: '#22C55E',
          700: '#15803D',
        },
        warning: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          500: '#F59E0B',
          700: '#B45309',
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
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
      },
    },
  },
} as const;

export default dreamPreset;
