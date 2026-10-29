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
  if (p.startsWith("/owner") || p === "/owner-dashboard" || p === "/list-tool") return "owner";
  if (p.startsWith("/borrower") || p === "/browse" || p === "/bookings") return "borrower";
  return null;
}

export function getStoredUser(preferredRole?: UserRole): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const role = preferredRole || getContextRole();

    if (role === "borrower") {
      const borrowerRaw = localStorage.getItem(BORROWER_STORAGE_KEY);
      if (borrowerRaw) {
        const parsed = JSON.parse(borrowerRaw);
        return {
          ...parsed,
          role: "borrower",
          isOwner: false,
        };
      }
    } else if (role === "owner") {
      const ownerRaw = localStorage.getItem(OWNER_STORAGE_KEY);
      if (ownerRaw) {
        const parsed = JSON.parse(ownerRaw);
        return {
          ...parsed,
          role: "owner",
          isOwner: true,
        };
      }
    }

    // Fallback to active/global user
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const isOwnerRole = parsed.role === "owner";
      return {
        ...parsed,
        role: isOwnerRole ? "owner" : "borrower",
        isOwner: isOwnerRole,
      };
    }

    // Fallback check
    const bRaw = localStorage.getItem(BORROWER_STORAGE_KEY);
    if (bRaw) {
      const parsed = JSON.parse(bRaw);
      return { ...parsed, role: "borrower", isOwner: false };
    }
    const oRaw = localStorage.getItem(OWNER_STORAGE_KEY);
    if (oRaw) {
      const parsed = JSON.parse(oRaw);
      return { ...parsed, role: "owner", isOwner: true };
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
    const isOwnerRole = user.role === "owner";
    const sanitized: AuthUser = {
      ...user,
      role: isOwnerRole ? "owner" : "borrower",
      isOwner: isOwnerRole,
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
          const isOwnerRole = data.user.role === "owner";
          const synced: AuthUser = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: isOwnerRole ? "owner" : "borrower",
            isOwner: isOwnerRole,
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
        // Network offline fallback
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
      } else if (currentRole === "borrower") {
        if (e.key === BORROWER_STORAGE_KEY) {
          setUser(getStoredUser("borrower"));
        }
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

    // 4. In-page auth sync when login/logout is triggered from another component in same window
    const handleAuthChange = () => {
      const currentRole = getContextRole();
      setUser(getStoredUser(currentRole || undefined));
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("toolshare_auth_change", handleAuthChange);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("toolshare_auth_change", handleAuthChange);
    };
  }, []);

  const login = (newUser: AuthUser) => {
    const isOwnerRole = newUser.role === "owner";
    const sanitized: AuthUser = {
      ...newUser,
      role: isOwnerRole ? "owner" : "borrower",
      isOwner: isOwnerRole,
    };
    setStoredUser(sanitized, sanitized.role);
    setUser(sanitized);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("toolshare_auth_change", { detail: sanitized })
      );
    }
  };

  const logout = async (roleToLogout?: UserRole) => {
    const role =
      roleToLogout ||
      getContextRole() ||
      user?.role ||
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
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("toolshare_auth_change", { detail: null })
      );
    }
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const isOwnerRole = newRole === "owner";
    const updated: AuthUser = {
      ...user,
      role: isOwnerRole ? "owner" : "borrower",
      isOwner: isOwnerRole,
    };
    login(updated);
  };

  return { user, login, logout, switchRole, loading };
}
