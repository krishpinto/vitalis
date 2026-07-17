// Ported from react-native-reusables and adapted — see text.tsx's header
// comment for the general pattern. Token mapping for this file:
// bg-primary/text-primary-foreground → night-accent/night-accent-ink (the
// white pill CTA, unchanged from the original NightButton); destructive →
// night-danger; outline/secondary/ghost surfaces → night-surface family;
// link → night-accent-2 (violet). Dropped shadcn's `dark:` variants — this
// theme isn't toggled, it's always-dark for these two screens.

import { cva, type VariantProps } from 'class-variance-authority';
import { Platform } from 'react-native';

import { cn } from '@/lib/cn';
import { Pressable } from '@/tw';
import { TextClassContext } from './text';

const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-2xl shadow-none',
    Platform.select({
      web: "focus-visible:border-night-accent-2 focus-visible:ring-night-accent-2/50 whitespace-nowrap outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    })
  ),
  {
    variants: {
      variant: {
        default: cn('bg-night-accent active:bg-night-accent/90', Platform.select({ web: 'hover:bg-night-accent/90' })),
        destructive: cn('bg-night-danger active:bg-night-danger/90', Platform.select({ web: 'hover:bg-night-danger/90' })),
        outline: cn(
          'border-night-border bg-night-surface active:bg-night-surface-hover border',
          Platform.select({ web: 'hover:bg-night-surface-hover' })
        ),
        secondary: cn(
          'bg-night-surface-strong active:bg-night-surface-hover',
          Platform.select({ web: 'hover:bg-night-surface-hover' })
        ),
        ghost: cn('active:bg-night-surface', Platform.select({ web: 'hover:bg-night-surface' })),
        link: '',
      },
      size: {
        default: cn('h-14 px-6 py-2', Platform.select({ web: 'has-[>svg]:px-3' })),
        sm: cn('h-9 gap-1.5 rounded-xl px-3', Platform.select({ web: 'has-[>svg]:px-2.5' })),
        lg: cn('h-14 rounded-2xl px-6', Platform.select({ web: 'has-[>svg]:px-4' })),
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva(cn('text-base font-semibold', Platform.select({ web: 'pointer-events-none transition-colors' })), {
  variants: {
    variant: {
      default: 'text-night-accent-ink',
      destructive: 'text-night-text',
      outline: cn('text-night-text', Platform.select({ web: 'group-hover:text-night-text' })),
      secondary: 'text-night-text',
      ghost: 'text-night-text',
      link: cn('text-night-accent-2 group-active:underline', Platform.select({ web: 'underline-offset-4 hover:underline group-hover:underline' })),
    },
    size: {
      default: '',
      sm: '',
      lg: '',
      icon: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

type ButtonProps = React.ComponentProps<typeof Pressable> & VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(props.disabled && 'opacity-40', buttonVariants({ variant, size }), className)}
        role="button"
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
