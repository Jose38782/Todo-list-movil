import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../config/theme';

type BadgeProps = {
  label: string;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  return (
    <View style={[styles.base, toneStyles[tone]]}>
      <Text style={[styles.text, toneTextStyles[tone]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});

const toneStyles = StyleSheet.create({
  neutral: {
    backgroundColor: colors.subtle,
  },
  primary: {
    backgroundColor: colors.primarySoft,
  },
  success: {
    backgroundColor: 'rgba(0,109,44,0.10)',
  },
  warning: {
    backgroundColor: 'rgba(255,171,64,0.16)',
  },
  danger: {
    backgroundColor: 'rgba(186,26,26,0.10)',
  },
});

const toneTextStyles = StyleSheet.create({
  neutral: {
    color: colors.textMuted,
  },
  primary: {
    color: colors.primary,
  },
  success: {
    color: colors.success,
  },
  warning: {
    color: '#9A6100',
  },
  danger: {
    color: colors.danger,
  },
});
