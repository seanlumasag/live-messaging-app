const DEFAULT_API_BASE_URL = 'http://localhost:8080';

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? DEFAULT_API_BASE_URL;

export type AuthResponse = {
  token: string;
  userId: string;
  email: string;
  displayName: string;
};

export type RoomResponse = {
  id: string;
  name: string;
  createdAt: string;
};

export type ChatMessageResponse = {
  id: string;
  roomId: string;
  sender: string;
  content: string;
  timestamp: string;
};

type ApiError = {
  status: number;
  message: string;
};

const getAuthToken = () => localStorage.getItem('authToken');

const buildError = async (response: Response): Promise<ApiError> => {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const data = (await response.json()) as { message?: string };
    return {
      status: response.status,
      message: data.message ?? response.statusText,
    };
  }
  const text = await response.text();
  return {
    status: response.status,
    message: text || response.statusText,
  };
};

const apiFetch = async <T>(
  path: string,
  options: RequestInit = {},
  requireAuth = true,
): Promise<T> => {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (requireAuth) {
    const token = getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw await buildError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const signup = (payload: {
  email: string;
  password: string;
  displayName: string;
}) =>
  apiFetch<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false);

export const login = (payload: { email: string; password: string }) =>
  apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false);

export const listRooms = () => apiFetch<RoomResponse[]>('/api/rooms');

export const createRoom = (payload: { name: string }) =>
  apiFetch<RoomResponse>('/api/rooms', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const joinRoomByName = (payload: { name: string }) =>
  apiFetch<void>('/api/rooms/join', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const deleteRoom = (roomId: string) =>
  apiFetch<void>(`/api/rooms/${roomId}`, {
    method: 'DELETE',
  });

export const deleteAccount = (payload: { password: string }) =>
  apiFetch<void>('/api/users/me/delete', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const listMessages = (roomId: string, limit = 50) =>
  apiFetch<ChatMessageResponse[]>(`/api/rooms/${roomId}/messages?limit=${limit}`);

export const sendMessage = (roomId: string, payload: { content: string }) =>
  apiFetch<ChatMessageResponse>(`/api/rooms/${roomId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
