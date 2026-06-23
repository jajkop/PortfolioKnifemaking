const TOKEN_KEY = 'noze_admin_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Wystąpił błąd.' }));
    throw new Error(error.message || 'Wystąpił błąd.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function apiGet<T>(path: string, auth = false): Promise<T> {
  const headers: HeadersInit = {};
  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(path, { headers });
  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body: unknown, auth = false): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response);
}

export async function apiPut<T>(path: string, body?: unknown, auth = false): Promise<T> {
  const headers: HeadersInit = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(path, {
    method: 'PUT',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(response);
}

export async function apiDelete(path: string, auth = false): Promise<void> {
  const headers: HeadersInit = {};
  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(path, { method: 'DELETE', headers });
  await handleResponse<void>(response);
}

export async function apiUpload<T>(path: string, file: File, auth = true): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);

  const headers: HeadersInit = {};
  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(path, {
    method: 'POST',
    headers,
    body: formData,
  });

  return handleResponse<T>(response);
}
