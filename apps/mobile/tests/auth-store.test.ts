import { useAuthStore } from "../src/stores/auth-store";

describe("auth store", () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, userId: null, role: null, isBootstrapped: false });
  });

  it("starts unauthenticated and not bootstrapped", () => {
    const state = useAuthStore.getState();
    expect(state.role).toBeNull();
    expect(state.isBootstrapped).toBe(false);
  });

  it("setAuth populates token, user, and role", () => {
    useAuthStore.getState().setAuth({ accessToken: "tok", userId: "u1", role: "BEEKEEPER" });
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe("tok");
    expect(state.role).toBe("BEEKEEPER");
  });

  it("clearAuth resets identity but leaves isBootstrapped untouched", () => {
    useAuthStore.getState().setBootstrapped();
    useAuthStore.getState().setAuth({ accessToken: "tok", userId: "u1", role: "BEEKEEPER" });
    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.isBootstrapped).toBe(true);
  });
});