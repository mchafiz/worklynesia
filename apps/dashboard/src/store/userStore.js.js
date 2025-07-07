import { create } from "zustand";

const API_BASE_URL = "http://localhost:3000/api";

export const userStore = create((set) => ({
  loading: null,
  error: null,
  users: [],

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  uploadAvatar: async (file) => {
    set({
      loading: {
        uploadAvatar: true,
      },
      error: null,
    });
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await fetch(`${API_BASE_URL}/upload-avatar`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      console.log(response);

      const data = await response.json();
      set((prev) => ({
        ...prev,
        loading: {
          uploadAvatar: false,
        },
      }));
      return data;
    } catch (err) {
      set({ error: err.message || "Failed to upload avatar", loading: false });
      throw err;
    }
  },

  uploadUsers: async (file) => {
    set({
      loading: {
        uploadUsers: true,
      },
      error: null,
    });
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/upload-users`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload users");
      }

      const data = await response.json();
      set((prev) => ({
        ...prev,
        loading: {
          uploadUsers: false,
        },
      }));
      return data;
    } catch (err) {
      set({ error: err.message || "Failed to upload users", loading: false });
      throw err;
    }
  },

  createUser: async (user) => {
    set({
      loading: {
        createEmployee: true,
      },
      error: null,
    });
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      const data = await response.json();
      set((prev) => ({
        ...prev,
        users: [...prev.users, data],
        loading: {
          createEmployee: false,
        },
      }));
      return data;
    } catch (err) {
      set({ error: err.message || "Failed to create user", loading: false });
      throw err;
    }
  },

  getUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to get users");
      }

      const data = await response.json();
      set({ users: data, loading: false });
      return data;
    } catch (err) {
      set({ error: err.message || "Failed to get users", loading: false });
      throw err;
    }
  },
}));
