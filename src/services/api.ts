import axios, { type AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { firebaseAuth } from './firebase';

export type Priority = 'low' | 'medium' | 'high';
export type ListCategory = 'PERSONAL' | 'WORK' | 'STUDY' | 'HEALTH' | 'OTHER';

export interface Task {
  id: string;
  listId: string;
  title: string;
  description: string;
  dueDate?: string | null;
  priority?: Priority;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskList {
  id: string;
  title: string;
  description: string;
  category: ListCategory;
  color: string;
  icon: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  isCompleted?: boolean;
  priority?: Priority;
  dueDate?: string;
}

export interface CreateListPayload {
  title: string;
  description?: string;
  category?: ListCategory;
  color?: string;
  icon?: string;
}

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface BackendAuthResponse {
  id: string;
  firebaseUid: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseLoginResponse {
  id: string;
  firebaseUid: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GlobalSearchResponse {
  query: string;
  totalResults: number;
  taskLists: TaskList[];
  tasks: Task[];
}

const getApiUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (envUrl) {
    return envUrl;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080';
  }

  return 'http://localhost:8080';
};

const API_BASE_URL = getApiUrl();
const TOKEN_STORAGE_KEY = 'auth_token';
const USER_STORAGE_KEY = 'backend_user';
const DELETED_LIST_IDS_KEY = 'deleted_list_ids';
const DELETED_TASK_IDS_KEY = 'deleted_task_ids';

const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  const firebaseToken = firebaseAuth?.currentUser ? await firebaseAuth.currentUser.getIdToken() : null;
  const token = firebaseToken ?? storedToken;

  if (token) {
    const nextConfig = config as any;
    nextConfig.headers = {
      ...(nextConfig.headers ?? {}),
      Authorization: `Bearer ${token}`,
    };
    return nextConfig;
  }

  return config;
});

export const apiRoutes = {
  status: '/status',
  authLogin: '/auth/login',
  users: '/users',
  userById: (userId: string) => `/users/${userId}`,
  taskLists: '/task-lists',
  taskListById: (listId: string) => `/task-lists/${listId}`,
  taskListTasks: (listId: string) => `/task-lists/${listId}/tasks`,
  taskById: (listId: string, taskId: string) => `/task-lists/${listId}/tasks/${taskId}`,
  taskListSearch: '/task-lists/search',
  taskSearch: (listId: string) => `/task-lists/${listId}/tasks/search`,
  globalSearch: '/search',
};

export const isApiConfigured = () => API_BASE_URL.length > 0;

export const saveAuthToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearAuthToken = async () => {
  await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  await AsyncStorage.removeItem(USER_STORAGE_KEY);
  await AsyncStorage.removeItem(DELETED_LIST_IDS_KEY);
  await AsyncStorage.removeItem(DELETED_TASK_IDS_KEY);
};

export const saveBackendUser = async (user: BackendAuthResponse) => {
  await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const getBackendUser = async () => {
  const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as BackendAuthResponse;
  } catch {
    return null;
  }
};

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
}

function asOptionalString(value: unknown): string | null | undefined {
  if (value === null) return null;
  const nextValue = asString(value);
  return nextValue || undefined;
}

async function readIdSet(storageKey: string) {
  const raw = await AsyncStorage.getItem(storageKey);

  if (!raw) {
    return new Set<string>();
  }

  try {
    const parsed = JSON.parse(raw);
    return new Set(
      Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
    );
  } catch {
    return new Set<string>();
  }
}

async function writeIdSet(storageKey: string, ids: Set<string>) {
  await AsyncStorage.setItem(storageKey, JSON.stringify(Array.from(ids)));
}

async function markDeletedList(listId: string) {
  const ids = await readIdSet(DELETED_LIST_IDS_KEY);
  ids.add(listId);
  await writeIdSet(DELETED_LIST_IDS_KEY, ids);
}

async function markDeletedTask(listId: string, taskId: string) {
  const ids = await readIdSet(DELETED_TASK_IDS_KEY);
  ids.add(`${listId}:${taskId}`);
  await writeIdSet(DELETED_TASK_IDS_KEY, ids);
}

async function isDeletedTask(listId: string, taskId: string) {
  const ids = await readIdSet(DELETED_TASK_IDS_KEY);
  return ids.has(`${listId}:${taskId}`);
}

function normalizePriority(value: unknown): Priority | undefined {
  const normalized = asString(value).toLowerCase();

  if (normalized === 'low' || normalized === 'medium' || normalized === 'high') {
    return normalized;
  }

  return undefined;
}

function normalizeCompleted(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    return normalized === 'true' || normalized === 'completed' || normalized === 'done';
  }

  return false;
}

function normalizeCategory(value: unknown): ListCategory {
  const normalized = asString(value, 'PERSONAL').toUpperCase();

  if (normalized === 'WORK' || normalized === 'STUDY' || normalized === 'HEALTH' || normalized === 'OTHER') {
    return normalized;
  }

  return 'PERSONAL';
}

function mapList(rawList: unknown): TaskList {
  const record = asRecord(rawList);

  return {
    id: asString(record.id ?? record._id ?? record.uuid),
    title: asString(record.title ?? record.name, 'Untitled list'),
    description: asString(record.description ?? ''),
    category: normalizeCategory(record.category),
    color: asString(record.color ?? '#2563EB', '#2563EB'),
    icon: asString(record.icon ?? 'book', 'book'),
    createdAt: asOptionalString(record.createdAt ?? record.created_at) ?? undefined,
    updatedAt: asOptionalString(record.updatedAt ?? record.updated_at) ?? undefined,
  };
}

function mapTask(rawTask: unknown): Task {
  const record = asRecord(rawTask);

  return {
    id: asString(record.id ?? record._id ?? record.uuid),
    listId: asString(record.listId ?? record.list_id ?? record.taskListId ?? ''),
    title: asString(record.title ?? record.name, 'Untitled task'),
    description: asString(record.description ?? '', ''),
    dueDate: asOptionalString(record.dueDate ?? record.due_date ?? null),
    priority: normalizePriority(record.priority),
    completed: normalizeCompleted(record.isCompleted ?? record.completed),
    createdAt: asOptionalString(record.createdAt ?? record.created_at) ?? undefined,
    updatedAt: asOptionalString(record.updatedAt ?? record.updated_at) ?? undefined,
  };
}

async function requestJson<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  if (!isApiConfigured()) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured.');
  }

  try {
    const response = await apiClient.request<T>({
      url: path,
      ...config,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const payload = error.response?.data;
      const message =
        typeof payload === 'object' && payload && 'error' in payload
          ? String((payload as { error?: unknown }).error ?? '')
          : typeof payload === 'string'
            ? payload
            : '';

      throw new Error(message || (status ? `API request failed with status ${status}` : 'API request failed.'));
    }

    throw error;
  }
}

export async function getStatus() {
  return requestJson<{ status: string }>(apiRoutes.status);
}

export async function backendLoginWithFirebaseToken(token: string) {
  const response = await requestJson<BackendAuthResponse>(apiRoutes.authLogin, {
    method: 'POST',
    data: { token },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await saveAuthToken(token);
  await saveBackendUser(response);
  return response;
}

export async function getCurrentBackendUser() {
  return getBackendUser();
}

export async function getLists() {
  const response = await requestJson<unknown[]>(apiRoutes.taskLists);
  const deletedIds = await readIdSet(DELETED_LIST_IDS_KEY);
  return (Array.isArray(response) ? response.map(mapList) : []).filter((list) => !deletedIds.has(list.id));
}

export async function getListById(id: string) {
  const response = await requestJson<unknown>(apiRoutes.taskListById(id));
  return mapList(response);
}

export async function createList(payload: CreateListPayload) {
  const response = await requestJson<unknown>(apiRoutes.taskLists, {
    method: 'POST',
    data: {
      ...payload,
      name: payload.title,
    },
  });

  return mapList(response);
}

export async function updateList(id: string, payload: Partial<CreateListPayload>) {
  const response = await requestJson<unknown>(apiRoutes.taskListById(id), {
    method: 'PUT',
    data: {
      ...payload,
      name: payload.title,
    },
  });

  return mapList(response);
}

export async function deleteList(id: string) {
  try {
    await requestJson<void>(apiRoutes.taskListById(id), {
      method: 'DELETE',
    });
  } catch {
    // Best-effort local delete for demo and offline-compatible flows.
  } finally {
    await markDeletedList(id);
  }
}

export async function deleteListWithTasks(id: string) {
  let tasks: Task[] = [];

  try {
    tasks = await getTasksByListId(id);
  } catch {
    tasks = [];
  }

  await Promise.allSettled(tasks.map((task) => deleteTask(id, task.id)));
  await deleteList(id);
}

export async function getTasksByListId(listId: string) {
  const response = await requestJson<unknown[]>(apiRoutes.taskListTasks(listId));
  const deletedIds = await readIdSet(DELETED_TASK_IDS_KEY);
  return (Array.isArray(response) ? response.map(mapTask) : []).filter((task) => !deletedIds.has(`${listId}:${task.id}`));
}

export async function getTaskById(listId: string, taskId: string) {
  if (await isDeletedTask(listId, taskId)) {
    throw new Error('Task not found.');
  }

  const response = await requestJson<unknown>(apiRoutes.taskById(listId, taskId));
  return mapTask(response);
}

export async function createTask(listId: string, payload: CreateTaskPayload) {
  const response = await requestJson<unknown>(apiRoutes.taskListTasks(listId), {
    method: 'POST',
    data: {
      ...payload,
      name: payload.title,
    },
  });

  return mapTask(response);
}

export async function updateTask(listId: string, taskId: string, payload: Partial<CreateTaskPayload>) {
  const response = await requestJson<unknown>(apiRoutes.taskById(listId, taskId), {
    method: 'PUT',
    data: {
      ...payload,
      name: payload.title,
    },
  });

  return mapTask(response);
}

export async function deleteTask(listId: string, taskId: string) {
  try {
    await requestJson<void>(apiRoutes.taskById(listId, taskId), {
      method: 'DELETE',
    });
  } catch {
    // Best-effort local delete for demo and offline-compatible flows.
  } finally {
    await markDeletedTask(listId, taskId);
  }
}

export async function searchLists(query: string) {
  const response = await requestJson<unknown[]>(apiRoutes.taskListSearch, {
    params: { q: query },
  });

  return Array.isArray(response) ? response.map(mapList) : [];
}

export async function searchTasks(listId: string, query: string) {
  const response = await requestJson<unknown[]>(apiRoutes.taskSearch(listId), {
    params: { q: query },
  });

  return Array.isArray(response) ? response.map(mapTask) : [];
}

export async function searchGlobal(query: string) {
  const response = await requestJson<GlobalSearchResponse>(apiRoutes.globalSearch, {
    params: { q: query },
  });

  return {
    query: response.query,
    totalResults: response.totalResults,
    taskLists: Array.isArray(response.taskLists) ? response.taskLists.map(mapList) : [],
    tasks: Array.isArray(response.tasks) ? response.tasks.map(mapTask) : [],
  };
}

export async function registerUser(payload: RegisterUserPayload) {
  return requestJson<unknown>(apiRoutes.users, {
    method: 'POST',
    data: payload,
  });
}
