import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Surface } from '../components/Surface';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radii, spacing } from '../config/theme';
import { createList, deleteListWithTasks, getListById, updateList, type TaskList } from '../services/api';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ListForm'>;

export function ListFormScreen({ navigation, route }: Props) {
  const isEdit = route.params.mode === 'edit';
  const listId = isEdit ? route.params.listId : undefined;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskList['category']>('PERSONAL');
  const [color, setColor] = useState('#2563EB');
  const [icon, setIcon] = useState('book');
  const [loading, setLoading] = useState(Boolean(isEdit));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadList = async () => {
      if (!isEdit || !listId) return;

      try {
        const list = await getListById(listId);
        setTitle(list.title);
        setDescription(list.description);
        setCategory(list.category);
        setColor(list.color ?? '#2563EB');
        setIcon(list.icon ?? 'book');
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load list.');
      } finally {
        setLoading(false);
      }
    };

    loadList().catch(() => setLoading(false));
  }, [isEdit, listId]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('List title is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        title,
        description,
        category,
        color,
        icon,
      };

      if (isEdit && listId) {
        await updateList(listId, payload);
      } else {
        await createList(payload);
      }

      navigation.goBack();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save list.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!isEdit || !listId) return;
    setDeleting(true);
    setError(null);

    deleteListWithTasks(listId)
      .then(() => navigation.replace('Home'))
      .catch((deleteError) => {
        setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete list.');
      })
      .finally(() => setDeleting(false));
  };

  return (
    <Surface>
      <View style={styles.card}>
        <Text style={styles.kicker}>{isEdit ? 'Edit list' : 'Create list'}</Text>
        <Text style={styles.title}>{isEdit ? 'Update task list' : 'Create a new task list'}</Text>
        <Text style={styles.body}>
          {isEdit
          ? 'Modify the list title, description, category or icon.'
          : 'Create a list to organize tasks in the backend.'}
        </Text>

        {loading ? <StateText text="Loading list..." /> : null}
        {error ? <StateText text={error} danger /> : null}

        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="List title" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="List description"
            multiline
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={(value) => setCategory(value.toUpperCase() as TaskList['category'])}
            placeholder="PERSONAL"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Color</Text>
          <TextInput
            style={styles.input}
            value={color}
            onChangeText={setColor}
            placeholder="#2563EB"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Icon</Text>
          <TextInput
            style={styles.input}
            value={icon}
            onChangeText={setIcon}
            placeholder="book"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.footer}>
          {isEdit ? (
            <PrimaryButton
              label={deleting ? 'Deleting...' : 'Delete'}
              tone="soft"
              onPress={handleDelete}
              style={styles.button}
              disabled={loading || saving || deleting}
            />
          ) : null}
          <PrimaryButton
            label={saving ? 'Saving...' : isEdit ? 'Update list' : 'Create list'}
            onPress={handleSubmit}
            style={styles.button}
            disabled={loading || saving || deleting}
          />
        </View>
      </View>
    </Surface>
  );
}

function StateText({ text, danger = false }: { text: string; danger?: boolean }) {
  return <Text style={[styles.state, danger && styles.stateDanger]}>{text}</Text>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md,
  },
  kicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  body: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  field: {
    gap: 6,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
  state: {
    color: colors.textMuted,
  },
  stateDanger: {
    color: colors.danger,
  },
});
