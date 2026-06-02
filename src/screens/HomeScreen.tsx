import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Surface } from '../components/Surface';
import { StudyListCard } from '../components/StudyListCard';
import { colors, spacing } from '../config/theme';
import { deleteListWithTasks, getLists, isApiConfigured, type TaskList } from '../services/api';
import type { RootStackParamList } from '../../App';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const FALLBACK_LISTS: TaskList[] = [
  {
    id: 'demo-list-1',
    title: 'Computer Science',
    description: 'Local fallback list shown while the backend URL is not configured.',
    category: 'STUDY',
    color: '#005BBF',
    icon: 'book',
  },
];

export function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const compact = width < 390;
  const [lists, setLists] = useState<TaskList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteList = (listId: string) => {
    Alert.alert('Delete list', 'This will remove the list and its tasks.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteListWithTasks(listId)
            .then(() => {
              setLists((prev) => prev.filter((item) => item.id !== listId));
            })
            .catch((deleteError) => {
              setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete list.');
            });
        },
      },
    ]);
  };

  const loadLists = useCallback(async () => {
    if (!isApiConfigured()) {
      setLists(FALLBACK_LISTS);
      setLoading(false);
      setError('EXPO_PUBLIC_API_URL is not configured. Showing local fallback data.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getLists();
      setLists(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load lists.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLists().catch(() => {
        setError('Unable to load lists.');
        setLoading(false);
      });
    }, [loadLists])
  );

  return (
    <Surface>
      <View style={[styles.heroCard, compact && styles.heroCardCompact]}>
        <View style={[styles.heroTopRow, compact && styles.heroTopRowCompact]}>
          <View>
            <Text style={styles.kicker}>Dashboard</Text>
            <Text style={[styles.title, compact && styles.titleCompact]}>Study lists on mobile</Text>
          </View>
          <View style={[styles.badgePill, compact && styles.badgePillCompact]}>
            <Text style={styles.badgePillText}>Expo</Text>
          </View>
        </View>
        <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>
          Browse real lists from GET /task-lists and open each list with its backend id.
        </Text>
        <Text style={styles.sessionText}>Signed in as {user?.email ?? user?.uid ?? 'session'}</Text>
        <View style={[styles.metricsRow, compact && styles.metricsRowCompact]}>
          <Metric label="Route" value="Home" />
          <Metric label="Mode" value={isApiConfigured() ? 'API' : 'Fallback'} />
        </View>
        <View style={[styles.actions, compact && styles.actionsCompact]}>
          <PrimaryButton label="New List" onPress={() => navigation.navigate('ListForm', { mode: 'create' })} style={styles.flexButton} />
          <PrimaryButton label="About" tone="soft" onPress={() => navigation.navigate('About')} style={styles.flexButton} />
          <PrimaryButton label="Search" tone="soft" onPress={() => navigation.navigate('Search')} style={styles.flexButton} />
        </View>
      </View>

      {loading ? <StateCard text="Loading lists from GET /task-lists..." /> : null}
      {!loading && error ? <StateCard text={error} /> : null}
      {!loading && !error && lists.length === 0 ? <StateCard text="No lists returned by GET /task-lists." /> : null}

      {!loading && lists.length > 0 ? (
        <View style={styles.list}>
          {lists.map((item, index) => (
            <View key={item.id} style={index > 0 ? styles.listItemSpacing : undefined}>
              <StudyListCard
                title={item.title}
                description={item.description || `Open list ${item.id}`}
                completedTasks={0}
                totalTasks={0}
                themeColor={(item.color as '#005BBF' | '#006D2C' | '#475E8C' | '#BA1A1A' | '#7C4DFF' | '#FFAB40') || '#005BBF'}
                onPress={() => navigation.navigate('Tasks', { listId: item.id })}
                onEdit={() => navigation.navigate('ListForm', { mode: 'edit', listId: item.id })}
                onDelete={() => handleDeleteList(item.id)}
              />
            </View>
          ))}
        </View>
      ) : null}
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
  hero: {
    gap: spacing.sm,
  },
  heroCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  heroCardCompact: {
    padding: spacing.md,
    borderRadius: 20,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  heroTopRowCompact: {
    flexDirection: 'column',
  },
  badgePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  badgePillCompact: {
    alignSelf: 'flex-start',
  },
  badgePillText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  kicker: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 38,
  },
  titleCompact: {
    fontSize: 28,
    lineHeight: 32,
  },
  subtitle: {
    color: colors.textSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  sessionText: {
    color: colors.textSoft,
    fontSize: 12,
  },
  subtitleCompact: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionsCompact: {
    flexDirection: 'column',
  },
  flexButton: {
    flex: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricsRowCompact: {
    flexDirection: 'column',
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.surfaceSoft,
    gap: 4,
  },
  metricLabel: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metricValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  list: {
    gap: spacing.md,
  },
  listItemSpacing: {
    marginTop: spacing.md,
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}
