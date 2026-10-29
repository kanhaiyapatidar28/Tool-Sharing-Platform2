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
const OWNER_STORAGE_KEY = "toolshare_owner_user";
const BORROWER_STORAGE_KEY = "toolshare_borrower_user";
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

export function getContextRole(): UserRole | null {
  if (typeof window === "undefined") return null;
  const p = window.location.pathname;
  if (p.startsWith("/owner")) return "owner";
  if (p.startsWith("/borrower")) return "borrower";
  return null;
}

export function getStoredUser(preferredRole?: UserRole): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const role = preferredRole || getContextRole();

    if (role === "owner") {
      const ownerRaw = localStorage.getItem(OWNER_STORAGE_KEY);
      if (ownerRaw) {
        const parsed = JSON.parse(ownerRaw);
        return {
          ...parsed,
          role: "owner",
          isOwner: true,
        };
      }
    } else if (role === "borrower") {
      const borrowerRaw = localStorage.getItem(BORROWER_STORAGE_KEY);
      if (borrowerRaw) {
        const parsed = JSON.parse(borrowerRaw);
        return {
          ...parsed,
          role: "borrower",
          isOwner: false,
        };
      }
    }

    // Fallback to active/global user
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        role: parsed.role || (parsed.isOwner ? "owner" : "borrower"),
        isOwner: parsed.role === "owner" || Boolean(parsed.isOwner),
      };
    }

    // If still no global user, check if owner or borrower user exists
    const oRaw = localStorage.getItem(OWNER_STORAGE_KEY);
    if (oRaw) {
      const parsed = JSON.parse(oRaw);
      return { ...parsed, role: "owner", isOwner: true };
    }
    const bRaw = localStorage.getItem(BORROWER_STORAGE_KEY);
    if (bRaw) {
      const parsed = JSON.parse(bRaw);
      return { ...parsed, role: "borrower", isOwner: false };
    }

    return null;
  } catch (e) {
    return null;
  }
}

export function setStoredUser(user: AuthUser | null, targetRole?: UserRole) {
  if (typeof window === "undefined") return;
  const role = targetRole || user?.role || getContextRole() || undefined;

  if (user) {
    const sanitized: AuthUser = {
      ...user,
      role: user.role || (user.isOwner ? "owner" : "borrower"),
      isOwner: user.role === "owner" || Boolean(user.isOwner),
    };
    if (sanitized.role === "owner") {
      localStorage.setItem(OWNER_STORAGE_KEY, JSON.stringify(sanitized));
    } else {
      localStorage.setItem(BORROWER_STORAGE_KEY, JSON.stringify(sanitized));
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } else {
    // Role-specific sign-out
    if (role === "owner") {
      localStorage.removeItem(OWNER_STORAGE_KEY);
      // If global user was owner, see if borrower is still logged in
      const currentGlobal = localStorage.getItem(STORAGE_KEY);
      if (currentGlobal) {
        try {
          const parsed = JSON.parse(currentGlobal);
          if (parsed.role === "owner" || parsed.isOwner) {
            const borrowerRaw = localStorage.getItem(BORROWER_STORAGE_KEY);
            if (borrowerRaw) {
              localStorage.setItem(STORAGE_KEY, borrowerRaw);
            } else {
              localStorage.removeItem(STORAGE_KEY);
            }
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } else if (role === "borrower") {
      localStorage.removeItem(BORROWER_STORAGE_KEY);
      // If global user was borrower, see if owner is still logged in
      const currentGlobal = localStorage.getItem(STORAGE_KEY);
      if (currentGlobal) {
        try {
          const parsed = JSON.parse(currentGlobal);
          if (parsed.role === "borrower" || !parsed.isOwner) {
            const ownerRaw = localStorage.getItem(OWNER_STORAGE_KEY);
            if (ownerRaw) {
              localStorage.setItem(STORAGE_KEY, ownerRaw);
            } else {
              localStorage.removeItem(STORAGE_KEY);
            }
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(OWNER_STORAGE_KEY);
      localStorage.removeItem(BORROWER_STORAGE_KEY);
    }
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
    const contextRole = getContextRole();

    // 1. Initial optimistic load from localStorage
    const cached = getStoredUser(contextRole || undefined);
    if (cached) setUser(cached);

    // 2. Authoritative check with server session cookie
    const url = contextRole ? `/api/auth/me?role=${contextRole}` : "/api/auth/me";
    fetch(url, {
      headers: contextRole ? { "x-user-role": contextRole } : {},
    })
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
          setStoredUser(synced, contextRole || synced.role);
          setUser(synced);
        } else {
          // If server returns unauthorized and we don't have cached user, clear
          if (!cached) {
            setStoredUser(null, contextRole || undefined);
            setUser(null);
          }
        }
      })
      .catch(() => {
        // Network offline fallback: keep cached user only if offline
      })
      .finally(() => {
        setLoading(false);
      });

    // 3. Sync across tabs without cross-portal logout collision
    const handleStorage = (e: StorageEvent) => {
      const currentRole = getContextRole();

      if (currentRole === "owner") {
        if (e.key === OWNER_STORAGE_KEY) {
          setUser(getStoredUser("owner"));
        }
        // Ignores BORROWER_STORAGE_KEY changes
      } else if (currentRole === "borrower") {
        if (e.key === BORROWER_STORAGE_KEY) {
          setUser(getStoredUser("borrower"));
        }
        // Ignores OWNER_STORAGE_KEY changes
      } else {
        if (
          e.key === STORAGE_KEY ||
          e.key === OWNER_STORAGE_KEY ||
          e.key === BORROWER_STORAGE_KEY
        ) {
          setUser(getStoredUser());
        }
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
    setStoredUser(sanitized, sanitized.role);
    setUser(sanitized);
  };

  const logout = async (roleToLogout?: UserRole) => {
    const role =
      roleToLogout ||
      user?.role ||
      getContextRole() ||
      undefined;

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
    } catch {
      // Ignore network errors on logout
    }

    setStoredUser(null, role);
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
