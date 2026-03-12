export interface UserInfo {
  id: number;
  email?: string;
  nickname: string;
  role: 'parent' | 'child';
  points?: number;
}

export function getUser(): UserInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setAuth(token: string, user: UserInfo) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
