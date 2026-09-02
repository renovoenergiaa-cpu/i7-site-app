import { UserDTO } from '@i7/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const AUTH_STORAGE_KEY = 'i7_user_session';

export interface UserSession {
  user: UserDTO;
  accessToken: string;
}

export function getCurrentSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
}

export function setCurrentSession(session: UserSession | null) {
  if (typeof window === 'undefined') return;
  if (!session) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }
}

export async function loginUser(email: string, password: string): Promise<UserSession> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'E-mail ou senha inválidos');
  }

  const data = await res.json();
  setCurrentSession(data);
  return data;
}

export async function registerUser(name: string, email: string, password: string, role: 'TENANT' | 'OWNER' | 'BROKER'): Promise<{ message: string; email: string; devVerificationCode?: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Não foi possível realizar o cadastro.');
  }

  return await res.json();
}

export async function verifyEmailUser(email: string, code: string): Promise<UserSession> {
  const res = await fetch(`${API_BASE_URL}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Código de verificação incorreto.');
  }

  const data = await res.json();
  setCurrentSession(data);
  return data;
}

export function logoutUser() {
  setCurrentSession(null);
}
