// =============================================================================
// Artisan Connect — Global Application Store (Zustand v5 + persist)
// =============================================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authClient } from "@/lib/auth-client";

import type {
  User,
  ArtisanProfile,
  Notification,
  SearchFilters,
  AppView,
  RegisterData,
  ApiResponse,
} from "./types";

interface AppStoreState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentView: AppView;
  selectedArtisanId: string | null;
  searchQuery: string;
  searchResults: ArtisanProfile[];
  searchFilters: SearchFilters;
  notifications: Notification[];
  favoriteIds: string[];
}

interface AppStoreActions {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
  setView: (view: AppView) => void;
  setSelectedArtisan: (id: string | null) => void;
  search: (query: string, filters?: SearchFilters) => Promise<void>;
  fetchArtisans: (filters?: SearchFilters) => Promise<void>;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  toggleFavorite: (artisanId: string) => void;
  isFavorite: (artisanId: string) => boolean;
}

export type AppStore = AppStoreState & AppStoreActions;

const AUTH_STORAGE_KEY = "artisan-connecte-auth";

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

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
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
      favoriteIds: [],

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const result = await authClient.signIn.email({
            email,
            password,
          });
          if (result.error) {
            set({ isLoading: false });
            throw new Error(result.error.message ?? "Login failed");
          }
          const session = await authClient.getSession();
          const user = session?.data?.user as unknown as User;
          if (user) {
            set({
              user,
              token: null,
              isAuthenticated: true,
              isLoading: false,
              currentView: "home",
            });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          const result = await authClient.signUp.email({
            email: data.email,
            password: data.password,
            name: data.name,
          });
          if (result.error) {
            set({ isLoading: false });
            throw new Error(result.error.message ?? "Registration failed");
          }
          const newUserId = result.data?.user?.id;
          if (newUserId) {
            try {
              await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({
                  userId: newUserId,
                  phone: data.phone ?? null,
                  location: data.location ?? null,
                  country: data.country ?? null,
                  role: (data as any).role ?? null,
                }),
              });
            } catch {
              // On ignore l'erreur, l'inscription continue
            }

            // Créer automatiquement le profil artisan si le rôle est "artisan"
            if (data.role === "artisan") {
              try {
                await fetch("/api/artisans", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId: newUserId,
                    specialties: JSON.stringify([]),
                    skills: JSON.stringify([]),
                    hourlyRate: 0,
                    experience: 0,
                    portfolio: JSON.stringify([]),
                    certifications: JSON.stringify([]),
                  }),
                });
              } catch {
                // On ignore l'erreur, l'inscription continue
              }
            }
          }
          const session = await authClient.getSession();
          const user = session?.data?.user as unknown as User;
          set({
            user: user ? { ...user, role: data.role } as User : null,
            token: null,
            isAuthenticated: true,
            isLoading: false,
            currentView: "onboarding",
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        authClient.signOut();
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
        authClient.getSession().then((session) => {
          if (session?.data?.user) {
            set({
              user: session.data.user as unknown as User,
              token: null,
              isAuthenticated: true,
            });
          }
        });
      },

      setView: (view: AppView) => {
        set({ currentView: view });
      },

      setSelectedArtisan: (id: string | null) => {
        set({ selectedArtisanId: id });
      },

      search: async (query: string, filters?: SearchFilters) => {
        set({ isLoading: true, searchQuery: query });
        const mergedFilters: SearchFilters = { ...get().searchFilters, ...filters };
        set({ searchFilters: mergedFilters });
        const params = new URLSearchParams({ q: query });
        if (mergedFilters.category) params.set("category", mergedFilters.category);
        if (mergedFilters.location) params.set("location", mergedFilters.location);
        if (mergedFilters.priceMin !== undefined) params.set("priceMin", String(mergedFilters.priceMin));
        if (mergedFilters.priceMax !== undefined) params.set("priceMax", String(mergedFilters.priceMax));
        if (mergedFilters.rating !== undefined) params.set("rating", String(mergedFilters.rating));
        const res = await apiRequest<ArtisanProfile[]>(`/api/search?${params.toString()}`, {}, null);
        const artisans = (res as any).artisans ?? (res as any).data ?? [];
        set({ searchResults: res.success ? artisans : [], isLoading: false, currentView: "search" });
      },

      fetchArtisans: async (filters?: SearchFilters) => {
        set({ isLoading: true });
        const mergedFilters: SearchFilters = { ...get().searchFilters, ...filters };
        const params = new URLSearchParams();
        if (mergedFilters.category) params.set("category", mergedFilters.category);
        if (mergedFilters.location) params.set("location", mergedFilters.location);
        if (mergedFilters.priceMin !== undefined) params.set("priceMin", String(mergedFilters.priceMin));
        if (mergedFilters.priceMax !== undefined) params.set("priceMax", String(mergedFilters.priceMax));
        if (mergedFilters.rating !== undefined) params.set("rating", String(mergedFilters.rating));
        const qs = params.toString();
        const url = qs ? `/api/artisans?${qs}` : "/api/artisans";
        const res = await apiRequest<ArtisanProfile[]>(url, {}, null);
        const artisans = (res as any).artisans ?? (res as any).data ?? [];
        set({ searchResults: res.success ? artisans : [], searchFilters: mergedFilters, isLoading: false });
      },

      addNotification: (notification: Notification) => {
        set((state) => ({ notifications: [notification, ...state.notifications] }));
      },

      markNotificationRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n),
        }));
      },

      markAllNotificationsRead: () => {
        set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, isRead: true })) }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      updateAvatar: async (avatarUrl: string) => {
        const { user } = get();
        if (!user) return;
        const res = await apiRequest<{ user: User }>(
          "/api/user/profile",
          { method: "PATCH", body: JSON.stringify({ userId: user.id, avatar: avatarUrl }) },
          null
        );
        if (res.success) {
          set({ user: { ...user, avatar: avatarUrl } as User });
        }
      },

      updateProfile: async (data: Partial<User>) => {
        const { user } = get();
        if (!user) return;
        const res = await apiRequest<{ user: User }>(
          "/api/user/profile",
          { method: "PATCH", body: JSON.stringify({ userId: user.id, ...data }) },
          null
        );
        if (res.success) {
          set({ user: { ...user, ...data } as User });
        }
      },

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
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        favoriteIds: state.favoriteIds,
      }),
    }
  )
);