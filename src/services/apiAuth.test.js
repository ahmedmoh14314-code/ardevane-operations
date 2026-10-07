import { beforeEach, describe, expect, it, vi } from "vitest";

// A tiny stand-in for the Supabase client: just the calls login() makes
const auth = {
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
};

let membership = null;

vi.mock("./supabase", () => ({
  supabaseUrl: "https://example.supabase.co",
  default: {
    auth,
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: membership, error: null }),
          }),
        }),
      }),
    }),
  },
}));

const { login } = await import("./apiAuth");

const account = { id: "user-1", email: "maya@example.com" };

beforeEach(() => {
  vi.clearAllMocks();
  membership = null;
  auth.signInWithPassword.mockResolvedValue({
    data: { user: account },
    error: null,
  });
});

describe("login", () => {
  it("lets an active member of staff in, with their role", async () => {
    membership = { role: "front_desk", fullName: "Maya Lindqvist" };

    const user = await login({ email: account.email, password: "secret" });

    expect(user.staff.role).toBe("front_desk");
    expect(auth.signOut).not.toHaveBeenCalled();
  });

  it("turns a guest account away and signs it out again", async () => {
    await expect(
      login({ email: account.email, password: "secret" }),
    ).rejects.toThrow("doesn't have access");

    expect(auth.signOut).toHaveBeenCalledOnce();
  });

  it("gives one message for a wrong email or password", async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid login credentials" },
    });

    await expect(
      login({ email: account.email, password: "wrong" }),
    ).rejects.toThrow("Email or password is incorrect");
  });
});
