import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { User, addAuditLog, saveStore } from './bankData';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

interface StoredSession {
  userId: string;
  issuedAt: string;
  expiresAt: string;
  nonce: string;
}

interface LoginAttemptState {
  count: number;
  lastFailedAt: string;
  lockedUntil?: string;
}

const SESSION_KEY = 'bankSystem.session';
const LOGIN_ATTEMPTS_KEY = 'bankSystem.loginAttempts';
const SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;

const AuthContext = createContext<AuthContextType | null>(null);

function readSession(): StoredSession | null {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function writeSession(session: StoredSession | null) {
  if (!session) {
    sessionStorage.removeItem(SESSION_KEY);
    return;
  }

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function readAttempts(): Record<string, LoginAttemptState> {
  try {
    const stored = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function writeAttempts(attempts: Record<string, LoginAttemptState>) {
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
}

function clearAttempts(email: string) {
  const attempts = readAttempts();
  delete attempts[email];
  writeAttempts(attempts);
}

function registerFailedAttempt(email: string) {
  const attempts = readAttempts();
  const current = attempts[email];
  const count = (current?.count ?? 0) + 1;
  const nextAttempt: LoginAttemptState = {
    count,
    lastFailedAt: new Date().toISOString(),
    lockedUntil: count >= MAX_LOGIN_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS).toISOString() : undefined,
  };

  attempts[email] = nextAttempt;
  writeAttempts(attempts);
  return nextAttempt;
}

function getLockMessage(email: string) {
  const attempts = readAttempts()[email];
  if (!attempts?.lockedUntil) return null;

  const lockedUntilTime = new Date(attempts.lockedUntil).getTime();
  if (lockedUntilTime <= Date.now()) {
    clearAttempts(email);
    return null;
  }

  const remainingMinutes = Math.max(1, Math.ceil((lockedUntilTime - Date.now()) / 60000));
  return `Too many failed sign-in attempts. Try again in ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}.`;
}

async function hashPassword(password: string) {
  const data = new TextEncoder().encode(password);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function makeSession(userId: string): StoredSession {
  return {
    userId,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    nonce: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const store = useStore();
  const [session, setSession] = useState<StoredSession | null>(() => readSession());

  const currentUser = useMemo(() => {
    if (!session) return null;
    if (new Date(session.expiresAt).getTime() <= Date.now()) return null;

    const user = store.users.find(currentStoreUser => currentStoreUser.id === session.userId);
    if (!user || !user.active) return null;

    return user;
  }, [session, store]);

  useEffect(() => {
    if (!session) return;
    if (currentUser) return;

    setSession(null);
    writeSession(null);
  }, [currentUser, session]);

  useEffect(() => {
    if (!session) return undefined;

    const expiresIn = new Date(session.expiresAt).getTime() - Date.now();
    if (expiresIn <= 0) {
      setSession(null);
      writeSession(null);
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSession(null);
      writeSession(null);
    }, expiresIn);

    return () => window.clearTimeout(timeoutId);
  }, [session]);

  const login = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) return { success: false, error: 'Enter your email and password.' };

    const lockMessage = getLockMessage(normalizedEmail);
    if (lockMessage) return { success: false, error: lockMessage };

    const user = store.users.find(currentStoreUser => currentStoreUser.email === normalizedEmail);
    const passwordHash = await hashPassword(password);
    const passwordMatches = Boolean(user && (user.passwordHash === passwordHash || user.password === password));

    if (!user || !passwordMatches) {
      const attempt = registerFailedAttempt(normalizedEmail);
      addAuditLog('Login failed', user?.id ?? 'system', user?.id, `Invalid credentials for ${normalizedEmail}`);
      saveStore();

      return {
        success: false,
        error: attempt.lockedUntil ? getLockMessage(normalizedEmail) || 'Account temporarily locked.' : 'Invalid email or password.',
      };
    }

    if (!user.active) {
      addAuditLog('Blocked login', user.id, user.id, 'Suspended account sign-in attempt');
      saveStore();
      return { success: false, error: 'Account is suspended. Contact support.' };
    }

    clearAttempts(normalizedEmail);

    const nextSession = makeSession(user.id);
    setSession(nextSession);
    writeSession(nextSession);

    addAuditLog('Login', user.id, undefined, `${user.role} login`);
    saveStore();
    return { success: true };
  }, [store.users]);

  const logout = useCallback(() => {
    if (currentUser) {
      addAuditLog('Logout', currentUser.id);
      saveStore();
    }

    setSession(null);
    writeSession(null);
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
