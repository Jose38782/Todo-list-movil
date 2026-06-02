import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { colors, radii, spacing } from '../config/theme';

type ToggleCompletedProps = {
  showCompleted: boolean;
  onToggle: (value: boolean) => void;
};

export function ToggleCompleted({ showCompleted, onToggle }: ToggleCompletedProps) {
  const { width } = useWindowDimensions();
  const compact = width < 390;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Pressable
        onPress={() => onToggle(true)}
        style={({ pressed }) => [
          styles.button,
          compact && styles.buttonCompact,
          showCompleted ? styles.active : styles.inactive,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.label, showCompleted ? styles.labelActive : styles.labelInactive]}>
          Show Completed
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onToggle(false)}
        style={({ pressed }) => [
          styles.button,
          compact && styles.buttonCompact,
          !showCompleted ? styles.active : styles.inactive,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.label, !showCompleted ? styles.labelActive : styles.labelInactive]}>
          Hide Completed
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.subtle,
    padding: 4,
    borderRadius: radii.sm,
    gap: 8,
    alignSelf: 'flex-start',
  },
  containerCompact: {
    width: '100%',
    alignSelf: 'stretch',
    flexDirection: 'column',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  buttonCompact: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: colors.surface,
  },
  inactive: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.9,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
  },
  labelActive: {
    color: colors.primary,
  },
  labelInactive: {
    color: colors.textMuted,
  },
});
