import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth.schemas";

describe("auth schemas", () => {
  it("normalizes register email and accepts a valid password", () => {
    const payload = registerSchema.parse({
      email: " Player@Example.COM ",
      name: "Player",
      password: "supersecret",
    });

    expect(payload.email).toBe("player@example.com");
  });

  it("rejects short register passwords", () => {
    expect(() =>
      registerSchema.parse({
        email: "player@example.com",
        password: "short",
      }),
    ).toThrow();
  });

  it("normalizes login email", () => {
    const payload = loginSchema.parse({
      email: " Player@Example.COM ",
      password: "supersecret",
    });

    expect(payload.email).toBe("player@example.com");
  });
});
