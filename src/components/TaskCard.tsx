import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge } from './Badge';
import { colors, radii, spacing } from '../config/theme';
import type { Priority } from '../services/api';

type TaskCardProps = {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  priority?: Priority;
  completed: boolean;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showUnsupportedActions?: boolean;
};

function priorityTone(priority?: Priority) {
  switch (priority) {
    case 'high':
      return 'danger';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'neutral';
  }
}

export function TaskCard({
  id,
  title,
  description,
  dueDate,
  priority,
  completed,
  onView,
  onEdit,
  onDelete,
  showUnsupportedActions = false,
}: TaskCardProps) {
  return (
    <View style={[styles.card, completed && styles.completedCard]}>
      <View style={styles.statusIndicator} />

      <View style={styles.content}>
        <Text style={[styles.title, completed && styles.completedText]}>{title}</Text>
        <Text style={[styles.description, completed && styles.completedText]}>{description}</Text>

        {(dueDate || priority) && (
          <View style={styles.footer}>
            {dueDate ? <Badge label={formatDate(dueDate)} tone="neutral" /> : null}
            {priority ? <Badge label={priority.toUpperCase()} tone={priorityTone(priority)} /> : null}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {onView ? (
          <Pressable onPress={() => onView(id)} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
            <Text style={styles.actionIcon}>i</Text>
          </Pressable>
        ) : null}
        {onEdit ? (
          <Pressable onPress={() => onEdit(id)} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
            <Text style={styles.actionIcon}>E</Text>
          </Pressable>
        ) : null}
        {onDelete ? (
          <Pressable
            onPress={() => onDelete(id)}
            style={({ pressed }) => [styles.actionButton, styles.deleteButton, pressed && styles.pressed]}
          >
            <Text style={[styles.actionIcon, styles.deleteIcon]}>X</Text>
          </Pressable>
        ) : null}
        {showUnsupportedActions ? <Text style={styles.unsupported}>Edit/Delete unavailable</Text> : null}
      </View>
    </View>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: spacing.lg,
    alignItems: 'flex-start',
    gap: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  completedCard: {
    backgroundColor: '#F7F8FB',
  },
  statusIndicator: {
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: '#E0E2EC',
    marginTop: 4,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  completedText: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  actions: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.subtle,
  },
  pressed: {
    opacity: 0.85,
  },
  actionIcon: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  deleteButton: {
    backgroundColor: 'rgba(186,26,26,0.10)',
  },
  deleteIcon: {
    color: colors.danger,
  },
  unsupported: {
    color: colors.textSoft,
    fontSize: 11,
    width: 84,
    textAlign: 'right',
  },
});
