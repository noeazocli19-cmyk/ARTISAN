// =============================================================================
// Artisan Connecté — Global Application Store (Zustand v5 + persist)
// =============================================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  User,
  ArtisanProfile,
  Notification,
  SearchFilters,
  AppView,
  RegisterData,
  ApiResponse,
} from "./types";

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface AppStoreState {
  // Auth
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // View
  currentView: AppView;
  selectedArtisanId: string | null;

  // Search
  searchQuery: string;
  searchResults: ArtisanProfile[];
  searchFilters: SearchFilters;

  // Notifications
  notifications: Notification[];

  // Favorites
  favoriteIds: string[];
}

interface AppStoreActions {
  // Auth
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;

  // View
  setView: (view: AppView) => void;

  // Artisan
  setSelectedArtisan: (id: string | null) => void;

  // Search
  search: (query: string, filters?: SearchFilters) => Promise<void>;
  fetchArtisans: (filters?: SearchFilters) => Promise<void>;

  // Notifications
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Profile
  updateAvatar: (avatarUrl: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;

  // Favorites
  toggleFavorite: (artisanId: string) => void;
  isFavorite: (artisanId: string) => boolean;
}

export type AppStore = AppStoreState & AppStoreActions;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const AUTH_STORAGE_KEY = "artisan-connecte-auth";

/** Small wrapper around fetch that attaches the Bearer token and parses JSON. */
async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(path, { ...options, headers });
    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.error ?? data.message ?? `Request failed with status ${res.status}`,
      };
    }

    return { success: true, ...data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ── Auth state ───────────────────────────────────────────────────────
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // ── View state ───────────────────────────────────────────────────────
      currentView: "landing",
      selectedArtisanId: null,

      // ── Search state ─────────────────────────────────────────────────────
      searchQuery: "",
      searchResults: [],
      searchFilters: {},

      // ── Notifications ────────────────────────────────────────────────────
      notifications: [],

      // ── Favorites ────────────────────────────────────────────────────────
      favoriteIds: [],

      // ═════════════════════════════════════════════════════════════════════
      // Actions
      // ═════════════════════════════════════════════════════════════════════

      // ── Auth ─────────────────────────────────────────────────────────────

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        const res = await apiRequest<{ user: User; token: string }>(
          "/api/auth/login",
          {
            method: "POST",
            body: JSON.stringify({ email, password }),
          }
        );

        if (!res.success) {
          set({ isLoading: false });
          throw new Error(res.error ?? "Login failed");
        }

        const user = (res as any).user as User;
        const token = (res as any).token as string;

        // Persist token in localStorage for cross-tab / reload survival
        if (typeof window !== "undefined") {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
        }

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          currentView: "dashboard",
        });
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });

        const res = await apiRequest<{ user: User; token: string }>(
          "/api/auth/register",
          {
            method: "POST",
            body: JSON.stringify(data),
          }
        );

        if (!res.success) {
          set({ isLoading: false });
          throw new Error(res.error ?? "Registration failed");
        }

        const user = (res as any).user as User;
        const token = (res as any).token as string;

        if (typeof window !== "undefined") {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
        }

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          currentView: "onboarding",
        });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          currentView: "landing",
          selectedArtisanId: null,
          searchQuery: "",
          searchResults: [],
          searchFilters: {},
          notifications: [],
        });
      },

      initializeAuth: () => {
        if (typeof window === "undefined") return;

        try {
          const raw = localStorage.getItem(AUTH_STORAGE_KEY);
          if (!raw) return;

          const { user, token } = JSON.parse(raw) as {
            user: User;
            token: string;
          };

          if (user && token) {
            set({
              user,
              token,
              isAuthenticated: true,
            });
          }
        } catch {
          // Corrupted entry — clean up
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      },

      // ── View ─────────────────────────────────────────────────────────────

      setView: (view: AppView) => {
        set({ currentView: view });
      },

      // ── Artisan ──────────────────────────────────────────────────────────

      setSelectedArtisan: (id: string | null) => {
        set({ selectedArtisanId: id });
      },

      // ── Search ───────────────────────────────────────────────────────────

      search: async (query: string, filters?: SearchFilters) => {
        set({ isLoading: true, searchQuery: query });

        const mergedFilters: SearchFilters = {
          ...get().searchFilters,
          ...filters,
        };

        set({ searchFilters: mergedFilters });

        const params = new URLSearchParams({ q: query });
        if (mergedFilters.category) params.set("category", mergedFilters.category);
        if (mergedFilters.location) params.set("location", mergedFilters.location);
        if (mergedFilters.priceMin !== undefined)
          params.set("priceMin", String(mergedFilters.priceMin));
        if (mergedFilters.priceMax !== undefined)
          params.set("priceMax", String(mergedFilters.priceMax));
        if (mergedFilters.rating !== undefined)
          params.set("rating", String(mergedFilters.rating));

        const res = await apiRequest<ArtisanProfile[]>(
          `/api/search?${params.toString()}`,
          {},
          get().token
        );

        const artisans = (res as any).artisans ?? (res as any).data ?? [];
        set({
          searchResults: res.success ? artisans : [],
          isLoading: false,
          currentView: "search",
        });
      },

      fetchArtisans: async (filters?: SearchFilters) => {
        set({ isLoading: true });

        const mergedFilters: SearchFilters = {
          ...get().searchFilters,
          ...filters,
        };

        const params = new URLSearchParams();
        if (mergedFilters.category) params.set("category", mergedFilters.category);
        if (mergedFilters.location) params.set("location", mergedFilters.location);
        if (mergedFilters.priceMin !== undefined)
          params.set("priceMin", String(mergedFilters.priceMin));
        if (mergedFilters.priceMax !== undefined)
          params.set("priceMax", String(mergedFilters.priceMax));
        if (mergedFilters.rating !== undefined)
          params.set("rating", String(mergedFilters.rating));

        const qs = params.toString();
        const url = qs ? `/api/artisans?${qs}` : "/api/artisans";

        const res = await apiRequest<ArtisanProfile[]>(
          url,
          {},
          get().token
        );

        const artisans = (res as any).artisans ?? (res as any).data ?? [];
        set({
          searchResults: res.success ? artisans : [],
          searchFilters: mergedFilters,
          isLoading: false,
        });
      },

      // ── Notifications ────────────────────────────────────────────────────

      addNotification: (notification: Notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
        }));
      },

      markNotificationRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        }));
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // ── Profile ──────────────────────────────────────────────────────────

      updateAvatar: async (avatarUrl: string) => {
        const { user, token } = get();
        if (!user) return;

        const res = await apiRequest<{ user: User }>(
          "/api/user/profile",
          {
            method: "PATCH",
            body: JSON.stringify({ userId: user.id, avatar: avatarUrl }),
          },
          token
        );

        if (res.success) {
          const updatedUser = { ...user, avatar: avatarUrl } as User;
          if (typeof window !== "undefined") {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: updatedUser, token }));
          }
          set({ user: updatedUser });
        }
      },

      updateProfile: async (data: Partial<User>) => {
        const { user, token } = get();
        if (!user) return;

        const res = await apiRequest<{ user: User }>(
          "/api/user/profile",
          {
            method: "PATCH",
            body: JSON.stringify({ userId: user.id, ...data }),
          },
          token
        );

        if (res.success) {
          const updatedUser = { ...user, ...data } as User;
          if (typeof window !== "undefined") {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: updatedUser, token }));
          }
          set({ user: updatedUser });
        }
      },

      // ── Favorites ──────────────────────────────────────────────────────────

      toggleFavorite: (artisanId: string) => {
        set((state) => {
          const isFav = state.favoriteIds.includes(artisanId);
          return {
            favoriteIds: isFav
              ? state.favoriteIds.filter((id) => id !== artisanId)
              : [...state.favoriteIds, artisanId],
          };
        });
      },

      isFavorite: (artisanId: string) => {
        return get().favoriteIds.includes(artisanId);
      },
    }),
    {
      name: "artisan-connecte-store",
      // Only persist auth-related fields and favorites; transient UI state resets on reload
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        favoriteIds: state.favoriteIds,
      }),
    }
  )
);
