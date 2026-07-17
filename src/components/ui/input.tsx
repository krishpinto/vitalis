// Ported from react-native-reusables and adapted — see text.tsx's header
// comment. border-input/bg-background/text-foreground/placeholder:text-
// muted-foreground → night-border/night-surface/night-text/night-text-faint.
// placeholderTextColor is also passed explicitly (not just via className)
// since native RN needs the real prop, not just a CSS variant, to be certain
// it applies regardless of how react-native-css maps `placeholder:` classes.

import { Platform } from 'react-native';

import { cn } from '@/lib/cn';
import { TextInput } from '@/tw';

function Input({ className, placeholderTextColor, ...props }: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor={placeholderTextColor ?? '#6E6D8C'}
      className={cn(
        'border-night-border bg-night-surface text-night-text flex h-14 w-full min-w-0 flex-row items-center rounded-2xl border px-4 py-1 text-base leading-5',
        props.editable === false && cn('opacity-40', Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' })),
        Platform.select({
          web: cn(
            'placeholder:text-night-text-faint selection:bg-night-accent-2 selection:text-night-text outline-none transition-[color,box-shadow] md:text-sm',
            'focus-visible:border-night-accent-2 focus-visible:ring-night-accent-2/50 focus-visible:ring-[3px]'
          ),
        }),
        className
      )}
      {...props}
    />
  );
}

export { Input };
