import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge } from './Badge';
import { colors, radii, spacing } from '../config/theme';

type ThemeColor = '#005BBF' | '#006D2C' | '#475E8C' | '#BA1A1A' | '#7C4DFF' | '#FFAB40';

type StudyListCardProps = {
  title: string;
  description: string;
  completedTasks: number;
  totalTasks: number;
  themeColor: ThemeColor;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function StudyListCard({
  title,
  description,
  completedTasks,
  totalTasks,
  themeColor,
  onPress,
  onEdit,
  onDelete,
}: StudyListCardProps) {
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.accentBar, { backgroundColor: themeColor }]} />
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Text style={styles.iconText}>LIST</Text>
        </View>
        <View style={styles.actionsRow}>
          <Badge label={`${totalTasks} Tasks`} tone="primary" />
          {onEdit ? (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                onEdit();
              }}
              style={styles.actionChip}
            >
              <Text style={styles.actionChipText}>Edit</Text>
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              style={[styles.actionChip, styles.actionChipDanger]}
            >
              <Text style={[styles.actionChipText, styles.actionChipTextDanger]}>Del</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.textSection}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{description}</Text>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: themeColor }]} />
        </View>
        <Text style={styles.progressLabel}>{percentage}% complete</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 183,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.subtle,
  },
  iconText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  textSection: {
    gap: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    flexShrink: 1,
  },
  actionChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.subtle,
  },
  actionChipDanger: {
    backgroundColor: 'rgba(186,26,26,0.10)',
  },
  actionChipText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  actionChipTextDanger: {
    color: colors.danger,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomSection: {
    gap: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E7EAF2',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressLabel: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '600',
  },
});
