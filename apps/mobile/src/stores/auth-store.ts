import { create } from "zustand";
import type { Role } from "@repo/types";

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  role: Role | null;
  isBootstrapped: boolean;
  setAuth: (data: { accessToken: string; userId: string; role: Role }) => void;
  clearAuth: () => void;
  setBootstrapped: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  userId: null,
  role: null,
  isBootstrapped: false,
  setAuth: ({ accessToken, userId, role }) => set({ accessToken, userId, role }),
  clearAuth: () => set({ accessToken: null, userId: null, role: null }),
  setBootstrapped: () => set({ isBootstrapped: true }),
}));