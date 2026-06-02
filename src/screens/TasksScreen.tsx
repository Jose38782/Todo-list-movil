import { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Surface } from '../components/Surface';
import { TaskCard } from '../components/TaskCard';
import { ToggleCompleted } from '../components/ToggleCompleted';
import { CreateTaskForm } from '../components/CreateTaskForm';
import { colors, spacing } from '../config/theme';
import {
  deleteListWithTasks,
  deleteTask,
  createTask,
  getListById,
  getTaskById,
  getTasksByListId,
  isApiConfigured,
  type Priority,
  type Task,
  type TaskList,
  updateTask,
} from '../services/api';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Tasks'>;

const FALLBACK_TASKS: Task[] = [
  {
    id: 'demo-task-1',
    listId: 'demo-list-1',
    title: 'Backend URL pending',
    description: 'Set EXPO_PUBLIC_API_URL to switch this page from fallback mode to real API mode.',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    priority: 'medium',
    completed: false,
  },
];

const FALLBACK_LIST: TaskList = {
  id: 'demo-list-1',
  title: 'Fallback List',
  description: 'Local fallback list shown while the backend URL is not configured.',
  category: 'PERSONAL',
  color: '#005BBF',
  icon: 'book',
};

export function TasksScreen({ navigation, route }: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 390;
  const { listId } = route.params;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [list, setList] = useState<TaskList | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskDetailsLoading, setTaskDetailsLoading] = useState(false);
  const [taskDetailsError, setTaskDetailsError] = useState<string | null>(null);

  const loadTasksPage = useCallback(async () => {
    if (!listId) {
      setError('Route parameter listId is required.');
      setIsLoading(false);
      return;
    }

    if (!isApiConfigured()) {
      setList({ ...FALLBACK_LIST, id: listId });
      setTasks(FALLBACK_TASKS.map((task) => ({ ...task, listId })));
      setError('EXPO_PUBLIC_API_URL is not configured. Showing local fallback data.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [listResponse, tasksResponse] = await Promise.all([
        getListById(listId),
        getTasksByListId(listId),
      ]);

      setList(listResponse);
      setTasks(tasksResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load tasks page.');
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  useFocusEffect(
    useCallback(() => {
      loadTasksPage().catch(() => {
        setError('Unable to load tasks page.');
        setIsLoading(false);
      });
    }, [loadTasksPage])
  );

  const visibleTasks = useMemo(
    () => (showCompleted ? tasks : tasks.filter((task) => !task.completed)),
    [showCompleted, tasks]
  );

  const handleSubmitTask = async (data: {
    title: string;
    description: string;
    dueDate: string;
    priority: Priority;
  }) => {
    setIsSaving(true);

    try {
      if (editingTask) {
        const updatedTask = await updateTask(listId, editingTask.id, {
          title: data.title,
          description: data.description,
          dueDate: data.dueDate || undefined,
          priority: data.priority,
          isCompleted: editingTask.completed,
        });

        setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
        setSelectedTask(updatedTask);
        setEditingTask(null);
        return;
      }

      const optimisticTask: Task = {
        id: `temp-${Date.now()}`,
        listId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate || undefined,
        priority: data.priority,
        completed: false,
      };

      setTasks((prev) => [optimisticTask, ...prev]);

      if (!isApiConfigured()) return;

      const createdTask = await createTask(listId, {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate || undefined,
        priority: data.priority,
        isCompleted: false,
      });

      setTasks((prev) => prev.map((task) => (task.id === optimisticTask.id ? createdTask : task)));
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? `Unable to sync task with backend: ${saveError.message}. It will stay visible locally.`
          : 'Unable to sync task with backend. It will stay visible locally.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewTask = async (taskId: string) => {
    setTaskDetailsLoading(true);
    setTaskDetailsError(null);

    if (!isApiConfigured()) {
      const fallbackTask = tasks.find((task) => task.id === taskId) ?? null;
      setSelectedTask(fallbackTask);
      setTaskDetailsLoading(false);
      return;
    }

    try {
      const task = await getTaskById(listId, taskId);
      setSelectedTask(task);
    } catch (loadError) {
      setTaskDetailsError(loadError instanceof Error ? loadError.message : 'Unable to load task.');
    } finally {
      setTaskDetailsLoading(false);
    }
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId) ?? null;
    setEditingTask(task);
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert('Delete task', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTask(listId, taskId)
            .then(() => setTasks((prev) => prev.filter((task) => task.id !== taskId)))
            .catch((deleteError) => {
              setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete task.');
            });
        },
      },
    ]);
  };

  const handleDeleteList = () => {
    Alert.alert('Delete list', 'This will delete the list and its tasks.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteListWithTasks(listId)
            .then(() => navigation.navigate('Home'))
            .catch((deleteError) => {
              setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete list.');
            });
        },
      },
    ]);
  };

  return (
    <Surface>
      <View style={[styles.content, compact && styles.contentCompact]}>
        <Text style={styles.kicker}>{list?.title ?? 'Tasks'}</Text>

        <View style={[styles.headerRow, compact && styles.headerRowCompact]}>
          <View style={styles.headerTextWrap}>
            <Text style={[styles.title, compact && styles.titleCompact]}>{list?.title ?? 'Tasks'}</Text>
            <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>
              {list?.description ?? 'Tasks loaded from GET /task-lists/{id}/tasks'}
            </Text>
          </View>
          <ToggleCompleted showCompleted={showCompleted} onToggle={setShowCompleted} />
        </View>

        <View style={styles.listActions}>
          <Text style={styles.listMeta}>
            {list?.category ?? 'PERSONAL'} · {list?.icon ?? 'book'} · {list?.color ?? '#2563EB'}
          </Text>
          <View style={styles.listActionsRow}>
            <Text style={styles.linkAction} onPress={() => navigation.navigate('ListForm', { mode: 'edit', listId })}>
              Edit list
            </Text>
            <Text style={styles.linkActionDanger} onPress={handleDeleteList}>
              Delete list
            </Text>
          </View>
        </View>

        <CreateTaskForm
          onSubmit={handleSubmitTask}
          isSaving={isSaving}
          submitLabel={editingTask ? 'Update task' : 'Add to list'}
          initialValues={
            editingTask
              ? {
                  title: editingTask.title,
                  description: editingTask.description,
                  dueDate: editingTask.dueDate ?? undefined,
                  priority: editingTask.priority ?? 'low',
                }
              : undefined
          }
          onCancel={editingTask ? () => setEditingTask(null) : undefined}
        />

        {isLoading ? <StateCard text="Loading list and tasks..." /> : null}
        {!isLoading && error ? <StateCard text={error} /> : null}
        {taskDetailsLoading ? <StateCard text="Loading task details from GET /task-lists/{id}/tasks/{taskId}..." /> : null}
        {taskDetailsError ? <StateCard text={taskDetailsError} /> : null}

        {selectedTask ? <SelectedTaskCard task={selectedTask} /> : null}

        {!isLoading && !error && visibleTasks.length === 0 ? (
          <StateCard text={`No tasks returned by GET /task-lists/${listId}/tasks.`} />
        ) : null}

        {visibleTasks.length > 0 ? (
          <View style={styles.taskList}>
            {visibleTasks.map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description}
                dueDate={task.dueDate ?? undefined}
                priority={task.priority}
                completed={task.completed}
                onView={handleViewTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </View>
        ) : null}

        {isSaving ? (
          <Text style={styles.savingText}>
            {editingTask ? 'Saving task with PUT /task-lists/{listId}/tasks/{taskId}...' : 'Saving task with POST /task-lists/{listId}/tasks...'}
          </Text>
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

function SelectedTaskCard({ task }: { task: Task }) {
  return (
    <View style={styles.detailsCard}>
      <Text style={styles.detailsTitle}>{'Task detail loaded from GET /task-lists/{id}/tasks/{taskId}'}</Text>
      <DetailRow label="ID" value={task.id} />
      <DetailRow label="Title" value={task.title} />
      <DetailRow label="Description" value={task.description || 'No description'} />
      <DetailRow label="List ID" value={task.listId} />
      <DetailRow label="Due date" value={task.dueDate ?? 'Not provided'} />
      <DetailRow label="Priority" value={task.priority ?? 'Not provided'} />
      <DetailRow label="Completed" value={task.completed ? 'Yes' : 'No'} />
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Text style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}: </Text>
      <Text style={styles.detailValue}>{value}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  contentCompact: {
    padding: spacing.md,
  },
  kicker: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  headerRow: {
    gap: spacing.md,
  },
  headerRowCompact: {
    alignItems: 'stretch',
  },
  listActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  listActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  listMeta: {
    color: colors.textSoft,
    fontSize: 12,
  },
  linkAction: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  linkActionDanger: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '800',
  },
  headerTextWrap: {
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 34,
  },
  titleCompact: {
    fontSize: 26,
    lineHeight: 30,
  },
  subtitle: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  subtitleCompact: {
    fontSize: 13,
    lineHeight: 18,
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
  detailsCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: 6,
  },
  detailsTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  detailRow: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  detailLabel: {
    fontWeight: '800',
    color: colors.text,
  },
  detailValue: {
    color: colors.textMuted,
  },
  taskList: {
    gap: spacing.md,
  },
  savingText: {
    color: colors.textSoft,
    fontSize: 14,
    marginTop: spacing.xs,
  },
});
