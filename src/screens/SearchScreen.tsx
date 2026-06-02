import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Surface } from '../components/Surface';
import { StudyListCard } from '../components/StudyListCard';
import { TaskCard } from '../components/TaskCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radii, spacing } from '../config/theme';
import { searchGlobal, type Task, type TaskList } from '../services/api';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Type something to search.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchGlobal(query.trim());
      setLists(results.taskLists);
      setTasks(results.tasks);
      setTotalResults(results.totalResults);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Unable to search.');
      setLists([]);
      setTasks([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Surface>
      <View style={styles.card}>
        <Text style={styles.kicker}>Search</Text>
        <Text style={styles.title}>Find lists and tasks</Text>
        <Text style={styles.body}>Search uses the same backend and shows results for both lists and tasks.</Text>
        <Text style={styles.body}>Results: {totalResults}</Text>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Search by title or keyword"
            placeholderTextColor={colors.textSoft}
          />
          <PrimaryButton label={loading ? 'Searching...' : 'Search'} onPress={handleSearch} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading ? <StateCard text="Searching backend..." /> : null}

        {lists.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lists</Text>
            {lists.map((list) => (
              <StudyListCard
                key={list.id}
                title={list.title}
                description={list.description}
                completedTasks={0}
                totalTasks={0}
                themeColor={(list.color as '#005BBF' | '#006D2C' | '#475E8C' | '#BA1A1A' | '#7C4DFF' | '#FFAB40') || '#005BBF'}
                onPress={() => navigation.navigate('Tasks', { listId: list.id })}
              />
            ))}
          </View>
        ) : null}

        {tasks.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tasks</Text>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description}
                dueDate={task.dueDate ?? undefined}
                priority={task.priority}
                completed={task.completed}
                onView={() => navigation.navigate('Tasks', { listId: task.listId })}
              />
            ))}
          </View>
        ) : null}

        {!loading && !error && lists.length === 0 && tasks.length === 0 ? (
          <StateCard text="No results yet." />
        ) : null}
      </View>
    </Surface>
  );
}

function StateCard({ text }: { text: string }) {
  return (
    <View style={styles.stateCard}>
      <Text style={styles.stateText}>{text}</Text>
    </View>
  );
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
  searchRow: {
    gap: spacing.sm,
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
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  stateCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  stateText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
