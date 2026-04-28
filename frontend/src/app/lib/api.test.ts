import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  changePassword,
  clearAuth,
  getMe,
  login,
  sendMessage,
  storeAuth,
  updateMe,
} from './api';

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

describe('api client', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends unauthenticated login requests with JSON body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({
      token: 'token-1',
      userId: 'user-1',
      email: 'test@example.com',
      username: 'tester',
      displayName: 'Tester',
    }));

    await login({ email: 'test@example.com', password: 'password123' });

    expect(fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    }));
    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(new Headers(options?.headers).get('Content-Type')).toBe('application/json');
    expect(new Headers(options?.headers).get('Authorization')).toBeNull();
  });

  it('adds bearer token for authenticated requests', async () => {
    localStorage.setItem('authToken', 'token-1');
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({
      id: 'user-1',
      email: 'test@example.com',
      username: 'tester',
      displayName: 'Tester',
    }));

    await getMe();

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(fetch).toHaveBeenCalledWith('/api/users/me', expect.any(Object));
    expect(new Headers(options?.headers).get('Authorization')).toBe('Bearer token-1');
  });

  it('serializes request bodies for mutating authenticated calls', async () => {
    localStorage.setItem('authToken', 'token-1');
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({
      id: 'user-1',
      email: 'new@example.com',
      username: 'tester',
      displayName: 'Tester',
    }));

    await updateMe({ email: 'new@example.com' });

    expect(fetch).toHaveBeenCalledWith('/api/users/me', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ email: 'new@example.com' }),
    }));
  });

  it('returns undefined for 204 responses', async () => {
    localStorage.setItem('authToken', 'token-1');
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(changePassword({
      currentPassword: 'old-password',
      newPassword: 'new-password',
    })).resolves.toBeUndefined();
  });

  it('parses JSON errors from failed responses', async () => {
    localStorage.setItem('authToken', 'token-1');
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(
      { error: 'Not a member of this room' },
      { status: 400 },
    ));

    await expect(sendMessage('room-1', { content: 'hello' })).rejects.toEqual({
      status: 400,
      message: 'Not a member of this room',
    });
  });

  it('falls back to text errors from failed responses', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('server unavailable', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    }));

    await expect(getMe()).rejects.toEqual({
      status: 503,
      message: 'server unavailable',
    });
  });

  it('stores and clears auth state', () => {
    storeAuth({
      token: 'token-1',
      userId: 'user-1',
      email: 'test@example.com',
      username: 'tester',
      displayName: 'Tester',
    });

    expect(localStorage.getItem('authToken')).toBe('token-1');
    expect(localStorage.getItem('isAuthenticated')).toBe('true');
    expect(localStorage.getItem('userName')).toBe('Tester');

    clearAuth();

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('isAuthenticated')).toBeNull();
    expect(localStorage.getItem('userName')).toBeNull();
  });
});
