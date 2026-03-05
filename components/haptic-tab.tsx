import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        // Haptic feedback on tab press for both iOS and Android.
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        props.onPressIn?.(ev);
      }}
    />
  );
}
