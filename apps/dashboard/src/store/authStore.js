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

  setUser: (user) => {
    set({ user });
  },

  changePassword: async (newPassword, currentPassword) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword, currentPassword }),
        credentials: "include", // penting untuk cookie HttpOnly
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Change password failed");
      }

      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        role: null,
      });

      return true;
    } catch (error) {
      console.error("Change password error:", error);
      set({
        error: error.message || "Change password failed",
        loading: false,
      });
      return false;
    }
  },
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

  getUserById: async () => {
    set({ loading: true, error: null });

    const response = await fetch(`${API_BASE_URL}/user`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (res) => {
      const data = await res.json();
      set({
        loading: false,
        user: {
          email: data.email,
          name: data.fullName,
          id: data.id,
          role: data.role,
          avatar: data.avatarUrl,
          phoneNumber: data.phoneNumber,
        },
      });
    });
    return response;
  },

  // In your authStore.js
  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
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
      set({
        user: {
          fullName: updatedUser.fullName,
          phoneNumber: updatedUser.phoneNumber,
        },
        loading: false,
      });
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
  checkAuthPrivate: async () => {
    set({ loading: true, error: null });
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
          set({ loading: false });
        }
      }

      if (res.ok) {
        const { user } = await res.json();
        set({ user, isAuthenticated: true, role: user.role, loading: false });
        return true;
      }

      set({ user: null, isAuthenticated: false, role: null, loading: false });
      return false;
    } catch {
      set({ user: null, isAuthenticated: false, role: null, loading: false });
      return false;
    }
  },

  checkAuthPublic: async () => {
    set({ loading: true, error: null });
    try {
      let res = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const { user } = await res.json();
        set({ user, isAuthenticated: true, role: user.role, loading: false });
        return true;
      }

      set({ user: null, isAuthenticated: false, role: null, loading: false });
      return false;
    } catch {
      set({ user: null, isAuthenticated: false, role: null, loading: false });
      return false;
    }
  },
}));

export default useAuthStore;
