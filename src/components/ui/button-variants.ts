import { cva, type VariantProps } from 'class-variance-authority';

/**
 * One button system for the whole site.
 * - Motion: colour/shadow/transform over the fast token (150ms) with the standard ease-out curve.
 * - Press: a 0.97 scale on :active (motion-safe only).
 * - Focus: a visible 2px Signal Blue ring with offset, keyboard only.
 * - Touch: every size is at least 44px tall below the sm breakpoint (Fitts's law); desktop keeps the compact sizes.
 */
export const buttonVariants = cva(
  [
    'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium',
    'transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-fast ease-standard',
    'motion-safe:active:scale-[0.97]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress [&[aria-busy=true]>svg:not(.animate-spin)]:hidden',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md',
        ink: 'bg-ink text-ink-foreground hover:bg-ink/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input bg-card text-foreground hover:border-foreground/30 hover:bg-muted',
        ghost: 'text-foreground hover:bg-muted',
        link: 'h-auto px-0 text-primary underline-offset-4 hover:underline motion-safe:active:scale-100',
        lime: 'bg-lime text-lime-foreground hover:bg-lime/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        default: 'h-11 px-4 sm:h-10',
        sm: 'h-11 px-3 text-xs sm:h-8',
        lg: 'h-12 px-6 text-base',
        icon: 'size-11 sm:size-10',
        'icon-sm': 'size-11 sm:size-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
