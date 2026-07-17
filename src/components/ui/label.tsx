// Not ported from react-native-reusables' @rn-primitives/label — that
// package's Root/Text render raw react-native Pressable/Text internally
// (confirmed by reading its dist output), bypassing this project's
// react-native-css wrapper entirely, so className on it would do nothing.
// This is a small equivalent built directly on @/tw instead.

import { cn } from '@/lib/cn';
import { Pressable, Text } from '@/tw';

function Label({
  className,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  disabled,
  children,
  ...props
}: React.ComponentProps<typeof Text> & {
  onPress?: () => void;
  onLongPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      className={cn('flex-row items-center gap-2', disabled && 'opacity-40')}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}>
      <Text className={cn('text-night-text-muted text-xs font-semibold uppercase tracking-wide', className)} {...props}>
        {children}
      </Text>
    </Pressable>
  );
}

export { Label };
