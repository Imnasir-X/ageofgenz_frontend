import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[0.68rem] font-medium uppercase tracking-[0.08em] transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        mist: 'border-transparent bg-mist text-secondary-foreground',
        outline: 'border-border text-muted-foreground',
        ink: 'border-transparent bg-ink text-ink-foreground',
        lime: 'border-transparent bg-lime text-lime-foreground',
        opinion: 'border-foreground/80 bg-transparent text-foreground',
      },
    },
    defaultVariants: { variant: 'mist' },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants };
