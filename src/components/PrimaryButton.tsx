import { Pressable, StyleSheet, Text, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../config/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  tone?: 'primary' | 'soft';
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, style, tone = 'primary', disabled = false }: PrimaryButtonProps) {
  const { width } = useWindowDimensions();
  const compact = width < 390;

  return (
      <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        tone === 'soft' ? styles.soft : styles.primary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, compact && styles.labelCompact, tone === 'soft' && styles.labelSoft]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  soft: {
    backgroundColor: colors.subtle,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  labelCompact: {
    fontSize: 13,
  },
  labelSoft: {
    color: colors.primary,
  },
});
