// src/store/authStore.js
import { create } from "zustand";
import Cookies from "js-cookie";

const API_BASE_URL = "http://localhost:3000/api"; // Update with your API base URL

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  role: null,
  loading: false,
  error: null,

  // authStore.js

  login: async (email, password, rememberMe) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: "include", // penting untuk cookie HttpOnly
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      // Tidak perlu ambil accessToken/refreshToken dari body
      const data = await response.json();

      // Ambil data user dari response (bukan dari token)
      const { user } = data;

      set({
        user: {
          id: user?.id,
          email: user?.email,
          name: user?.name,
        },
        isAuthenticated: true,
        role: user?.role,
        loading: false,
      });

      return true;
    } catch (error) {
      console.error("Login error:", error);
      set({
        error: error.message || "Login failed",
        loading: false,
      });
      return false;
    }
  },

  getUserById: (id) => {
    set({ loading: true, error: null });

    return fetch(`${API_BASE_URL}/users/${id}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  // In your authStore.js
  updateProfile: async (profileData, user) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const updatedUser = await response.json();
      set((state) => ({
        user: { ...state.user, ...updatedUser },
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  logout: () => {
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    set({
      user: null,
      isAuthenticated: false,
      role: null,
    });
  },

  // Di authStore.js
  checkAuth: async () => {
    try {
      let res = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        // Try refresh
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (refreshRes.ok) {
          res = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: "GET",
            credentials: "include",
          });
        }
      }

      if (res.ok) {
        const { user } = await res.json();
        set({ user, isAuthenticated: true, role: user.role });
        return true;
      }

      set({ user: null, isAuthenticated: false, role: null });
      return false;
    } catch {
      set({ user: null, isAuthenticated: false, role: null });
      return false;
    }
  },
}));

export default useAuthStore;
