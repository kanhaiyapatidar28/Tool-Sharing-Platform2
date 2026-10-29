"use client";

import { useState, useEffect } from "react";

export type UserRole = "owner" | "borrower";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isOwner: boolean;
  avatar?: string;
  phone?: string;
  city?: string;
}

export interface StoredCredentialUser extends AuthUser {
  password: string;
}

const STORAGE_KEY = "toolshare_user";
const REGISTERED_USERS_KEY = "toolshare_registered_users";

export const DEFAULT_CREDENTIALS: StoredCredentialUser[] = [
  {
    id: "usr-owner-1",
    name: "John Owner",
    email: "owner@toolshare.in",
    password: "password123",
    role: "owner",
    isOwner: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    phone: "+91 98200 12345",
    city: "Mumbai",
  },
  {
    id: "usr-borrower-1",
    name: "Bob Borrower",
    email: "borrower@toolshare.in",
    password: "password123",
    role: "borrower",
    isOwner: false,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    phone: "+91 98200 99887",
    city: "Mumbai",
  },
  {
    id: "usr-john",
    name: "John Owner",
    email: "john_owner@example.com",
    password: "ownerpassword1",
    role: "owner",
    isOwner: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    phone: "+91 98200 12345",
    city: "Mumbai",
  },
  {
    id: "usr-bob",
    name: "Bob Borrower",
    email: "bob_borrower@example.com",
    password: "borrowerpassword1",
    role: "borrower",
    isOwner: false,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    phone: "+91 98200 99887",
    city: "Mumbai",
  },
];

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      role: parsed.role || (parsed.isOwner ? "owner" : "borrower"),
      isOwner: parsed.role === "owner" || Boolean(parsed.isOwner),
    };
  } catch (e) {
    return null;
  }
}

export function setStoredUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) {
    const sanitized = {
      ...user,
      role: user.role || (user.isOwner ? "owner" : "borrower"),
      isOwner: user.role === "owner" || Boolean(user.isOwner),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getRegisteredUsers(): StoredCredentialUser[] {
  if (typeof window === "undefined") return DEFAULT_CREDENTIALS;
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(DEFAULT_CREDENTIALS));
      return DEFAULT_CREDENTIALS;
    }
    const list: StoredCredentialUser[] = JSON.parse(raw);
    return list;
  } catch (e) {
    return DEFAULT_CREDENTIALS;
  }
}

export function saveRegisteredUser(user: StoredCredentialUser): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getRegisteredUsers();
    // Check if email already registered
    const index = current.findIndex(
      (u) => u.email.toLowerCase() === user.email.toLowerCase()
    );
    if (index >= 0) {
      current[index] = { ...current[index], ...user };
    } else {
      current.push(user);
    }
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(current));
    return true;
  } catch (e) {
    return false;
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial optimistic load from localStorage
    const cached = getStoredUser();
    if (cached) setUser(cached);

    // 2. Authoritative check with server session cookie
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.user) {
          const synced: AuthUser = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            isOwner: data.user.isOwner,
            avatar: data.user.avatar,
            phone: data.user.phone,
            city: data.user.city,
          };
          setStoredUser(synced);
          setUser(synced);
        } else if (!cached) {
          setUser(null);
        }
      })
      .catch(() => {
        // Network or offline fallback: keep cached user
      })
      .finally(() => {
        setLoading(false);
      });

    // Sync across tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setUser(getStoredUser());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const login = (newUser: AuthUser) => {
    const sanitized: AuthUser = {
      ...newUser,
      role: newUser.role || (newUser.isOwner ? "owner" : "borrower"),
      isOwner: newUser.role === "owner" || Boolean(newUser.isOwner),
    };
    setStoredUser(sanitized);
    setUser(sanitized);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    }
    setStoredUser(null);
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const updated: AuthUser = {
      ...user,
      role: newRole,
      isOwner: newRole === "owner",
    };
    login(updated);
  };

  return { user, login, logout, switchRole, loading };
}
