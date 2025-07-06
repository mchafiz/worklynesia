import { create } from "zustand";

const API_BASE_URL = "http://localhost:3000/api";

export const useAttendanceStore = create((set) => ({
  isCheckedIn: false,

  attendanceOut: null,
  attendanceHistory: [],
  currentAttendance: null,
  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setIsCheckedIn: (isCheckedIn) => set({ isCheckedIn }),

  getHistory: async (
    from = new Date().toISOString().split("T")[0],
    to = new Date().toISOString().split("T")[0]
  ) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${API_BASE_URL}/attendance/history?to=${to}&from=${from}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get history");
      }

      const data = await response.json();
      set({
        attendanceHistory: data,
        loading: false,
      });
      return data;
    } catch (err) {
      set({
        error: err.message || "Failed to get history",
        loading: false,
      });
      throw err;
    }
  },
  checkIn: async (dataCheckin) => {
    set({ loading: true, error: null });
    try {
      const { address, lat, lng } = dataCheckin;
      const response = await fetch(`${API_BASE_URL}/attendance/checkin`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationIn: address,
          locationInLat: lat.toString(),
          locationInLng: lng.toString(),
          status: "wfh",
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to check in");
      }

      set({
        isCheckedIn: true,
        currentAttendance: data,
        loading: false,
      });
      return data;
    } catch (err) {
      set({ error: err.message || "Failed to check in", loading: false });
      throw err;
    }
  },

  getCurrentUserAttendance: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${API_BASE_URL}/attendance/currentUserAttendance`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get current user attendance");
      }

      const data = await response.json();

      set({
        currentAttendance: data,
        isCheckedIn: true,
        loading: false,
      });
      return data;
    } catch (err) {
      set({
        error: err.message || "Failed to get current user attendance",
        loading: false,
      });
      throw err;
    }
  },

  checkOut: async (dataCheckout) => {
    set({ loading: true, error: null });
    try {
      const { address, lat, lng } = dataCheckout;
      const response = await fetch(`${API_BASE_URL}/attendance/checkout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationOut: address,
          locationOutLat: lat.toString(),
          locationOutLng: lng.toString(),
          status: "wfh",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to check out");
      }

      const data = await response.json();
      set({
        isCheckedIn: false,
        attendanceOut: data,
        loading: false,
      });
      return data;
    } catch (err) {
      set({ error: err.message || "Failed to check out", loading: false });
      throw err;
    }
  },
}));
