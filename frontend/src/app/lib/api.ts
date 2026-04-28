export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export type AuthResponse = {
  token: string;
  userId: string;
  email: string;
  username: string;
  displayName: string;
};

export type UserResponse = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string;
};

export type FriendResponse = {
  id: string;
  username: string;
  displayName: string;
  online: boolean;
};

export type FriendRequestResponse = {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  status: string;
  createdAt: string;
};

export type ConversationResponse = {
  id: string;
  name: string;
  type: 'PUBLIC' | 'DIRECT' | 'GROUP';
  createdAt: string;
  members: FriendResponse[];
};

export type ChatMessageResponse = {
  id: string;
  roomId: string;
  sender: string;
  content: string;
  timestamp: string;
};

export type ApiError = {
  status: number;
  message: string;
};

const getAuthToken = () => localStorage.getItem('authToken');

const buildError = async (response: Response): Promise<ApiError> => {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const data = (await response.json()) as { message?: string; error?: string };
    return {
      status: response.status,
      message: data.message ?? data.error ?? response.statusText,
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
  username: string;
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

export const getMe = () => apiFetch<UserResponse>('/api/users/me');

export const updateMe = (payload: {
  email?: string;
  username?: string;
  displayName?: string;
  bio?: string;
}) =>
  apiFetch<UserResponse>('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const changePassword = (payload: { currentPassword: string; newPassword: string }) =>
  apiFetch<void>('/api/users/me/password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const deleteAccount = (payload: { password: string }) =>
  apiFetch<void>('/api/users/me/delete', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const listFriends = () => apiFetch<FriendResponse[]>('/api/friends');
export const searchFriend = (username: string) =>
  apiFetch<FriendResponse>(`/api/friends/search?username=${encodeURIComponent(username)}`);
export const listIncomingRequests = () =>
  apiFetch<FriendRequestResponse[]>('/api/friends/requests/incoming');
export const listSentRequests = () =>
  apiFetch<FriendRequestResponse[]>('/api/friends/requests/sent');
export const sendFriendRequest = (username: string) =>
  apiFetch<FriendRequestResponse>('/api/friends/requests', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
export const acceptFriendRequest = (id: string) =>
  apiFetch<FriendRequestResponse>(`/api/friends/requests/${id}/accept`, { method: 'POST' });
export const declineFriendRequest = (id: string) =>
  apiFetch<FriendRequestResponse>(`/api/friends/requests/${id}/decline`, { method: 'POST' });
export const cancelFriendRequest = (id: string) =>
  apiFetch<void>(`/api/friends/requests/${id}`, { method: 'DELETE' });

export const listConversations = () => apiFetch<ConversationResponse[]>('/api/conversations');
export const createDirectConversation = (username: string) =>
  apiFetch<ConversationResponse>('/api/conversations/direct', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
export const createGroupConversation = (payload: { name: string; memberUsernames: string[] }) =>
  apiFetch<ConversationResponse>('/api/conversations/groups', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const deleteRoom = (roomId: string) =>
  apiFetch<void>(`/api/rooms/${roomId}`, {
    method: 'DELETE',
  });

export const listMessages = (roomId: string, limit = 50) =>
  apiFetch<ChatMessageResponse[]>(`/api/rooms/${roomId}/messages?limit=${limit}`);

export const sendMessage = (roomId: string, payload: { content: string }) =>
  apiFetch<ChatMessageResponse>(`/api/rooms/${roomId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const clearAuth = () => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('username');
  localStorage.removeItem('userId');
  localStorage.removeItem('authToken');
};

export const storeAuth = (response: AuthResponse) => {
  localStorage.setItem('authToken', response.token);
  localStorage.setItem('userName', response.displayName);
  localStorage.setItem('userEmail', response.email);
  localStorage.setItem('username', response.username);
  localStorage.setItem('userId', response.userId);
  localStorage.setItem('isAuthenticated', 'true');
};
