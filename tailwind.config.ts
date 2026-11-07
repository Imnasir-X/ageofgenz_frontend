import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import animate from 'tailwindcss-animate';
import typography from '@tailwindcss/typography';

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        border: token('border'),
        input: token('input'),
        ring: token('ring'),
        background: token('background'),
        foreground: token('foreground'),
        primary: { DEFAULT: token('primary'), foreground: token('primary-foreground') },
        secondary: { DEFAULT: token('secondary'), foreground: token('secondary-foreground') },
        muted: { DEFAULT: token('muted'), foreground: token('muted-foreground') },
        accent: { DEFAULT: token('accent'), foreground: token('accent-foreground') },
        destructive: { DEFAULT: token('destructive'), foreground: token('destructive-foreground') },
        card: { DEFAULT: token('card'), foreground: token('card-foreground') },
        popover: { DEFAULT: token('popover'), foreground: token('popover-foreground') },
        ink: { DEFAULT: token('ink'), foreground: token('ink-foreground') },
        mist: { DEFAULT: token('mist'), foreground: token('mist-foreground') },
        lime: { DEFAULT: token('lime'), foreground: token('lime-foreground') },
        slate: { DEFAULT: token('slate') },
        signal: token('signal'),
      },
      fontFamily: {
        // Headlines and long-form: Newsreader (optical sizes). UI: Geist. Data: Geist Mono.
        display: ['"Newsreader Variable"', '"Newsreader Fallback"', '"Noto Serif Bengali"', ...defaultTheme.fontFamily.serif],
        serif: ['"Newsreader Variable"', '"Newsreader Fallback"', '"Noto Serif Bengali"', ...defaultTheme.fontFamily.serif],
        sans: ['"Geist Variable"', '"Geist Fallback"', '"Noto Sans Bengali"', ...defaultTheme.fontFamily.sans],
        mono: ['"Geist Mono Variable"', '"Noto Sans Bengali"', ...defaultTheme.fontFamily.mono],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      maxWidth: {
        prose: '68ch',
      },
      // Motion tokens: three durations, one ease-out curve. Every transition in the app uses these.
      // Reduced motion is honoured globally in globals.css and with motion-safe: on transforms.
      transitionDuration: {
        fast: 'var(--motion-fast)',
        base: 'var(--motion-base)',
        slow: 'var(--motion-slow)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'route-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up var(--motion-slow) var(--ease-standard) both',
        'route-in': 'route-in var(--motion-base) var(--ease-standard) both',
        shimmer: 'shimmer 1.4s infinite',
      },
    },
  },
  plugins: [animate, typography],
};

export default config;
