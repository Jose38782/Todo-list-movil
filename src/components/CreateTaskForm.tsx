import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { colors, radii, spacing } from '../config/theme';
import { PrimaryButton } from './PrimaryButton';
import type { Priority } from '../services/api';

type CreateTaskFormProps = {
  onSubmit: (data: {
    title: string;
    description: string;
    dueDate: string;
    priority: Priority;
  }) => void;
  isSaving?: boolean;
  submitLabel?: string;
  initialValues?: {
    title?: string;
    description?: string;
    dueDate?: string;
    priority?: Priority;
  };
  onCancel?: () => void;
};

const priorities: Priority[] = ['low', 'medium', 'high'];

export function CreateTaskForm({
  onSubmit,
  isSaving = false,
  submitLabel = 'ADD TO LIST',
  initialValues,
  onCancel,
}: CreateTaskFormProps) {
  const { width } = useWindowDimensions();
  const compact = width < 420;
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? '');
  const [priority, setPriority] = useState<Priority>(initialValues?.priority ?? 'low');
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => title.trim().length > 0 && !isSaving, [title, isSaving]);

  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title ?? '');
      setDescription(initialValues.description ?? '');
      setDueDate(initialValues.dueDate ?? '');
      setPriority(initialValues.priority ?? 'low');
      return;
    }

    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('low');
  }, [initialValues]);

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setError(null);
    onSubmit({ title, description, dueDate, priority });
    if (!initialValues) {
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('low');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.headingIcon}>ADD</Text>
        <Text style={styles.headingText}>Create New Task</Text>
      </View>

      <View style={styles.fieldSection}>
        <Text style={styles.label}>Task Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Study for finals"
          placeholderTextColor={colors.textSoft}
          style={styles.input}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <View style={styles.fieldSection}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Add more details about this task..."
          placeholderTextColor={colors.textSoft}
          style={[styles.input, styles.textArea]}
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={[styles.row, compact && styles.rowCompact]}>
        <View style={[styles.fieldSection, styles.flex1]}>
          <Text style={styles.label}>Due Date</Text>
          <TextInput
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSoft}
            style={styles.input}
          />
        </View>

        <View style={[styles.fieldSection, styles.flex1]}>
          <Text style={styles.label}>Priority</Text>
          <View style={[styles.priorityRow, compact && styles.priorityRowCompact]}>
            {priorities.map((item) => (
              <Pressable
                key={item}
                onPress={() => setPriority(item)}
                style={[
                  styles.priorityChip,
                  priority === item ? styles.priorityChipActive : styles.priorityChipInactive,
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    priority === item ? styles.priorityTextActive : styles.priorityTextInactive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={[styles.footerActions, compact && styles.footerActionsCompact]}>
        {onCancel ? (
          <PrimaryButton label="Cancel" tone="soft" onPress={onCancel} style={styles.footerButton} />
        ) : null}
        <PrimaryButton
          label={isSaving ? 'SAVING...' : submitLabel}
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={[styles.footerButton, compact && styles.submitCompact]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headingIcon: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  headingText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  fieldSection: {
    gap: 6,
  },
  flex1: {
    flex: 1,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    paddingLeft: 4,
  },
  input: {
    minHeight: 48,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowCompact: {
    flexDirection: 'column',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  priorityRowCompact: {
    justifyContent: 'flex-start',
  },
  priorityChip: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  priorityChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priorityChipInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  priorityTextActive: {
    color: colors.surface,
  },
  priorityTextInactive: {
    color: colors.textMuted,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    paddingLeft: 4,
  },
  footerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footerActionsCompact: {
    flexDirection: 'column',
  },
  footerButton: {
    flex: 1,
  },
  submitCompact: {
    alignSelf: 'stretch',
  },
});
