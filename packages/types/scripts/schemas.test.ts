import { describe, it, expect } from "vitest";
import {
  RoleSchema,
  UserCreateSchema,
  HiveSchema,
  SupplyChainEventCreateSchema,
  ScratchVerifySchema,
  VerificationOutcomeSchema,
} from "../src/index";

describe("enums", () => {
  it("accepts a valid role", () => {
    expect(RoleSchema.parse("BEEKEEPER")).toBe("BEEKEEPER");
  });

  it("rejects an invalid role", () => {
    expect(() => RoleSchema.parse("SUPERADMIN")).toThrow();
  });
});

describe("UserCreateSchema", () => {
  it("accepts a valid registration payload", () => {
    const result = UserCreateSchema.parse({
      name: "Haider Ali",
      email: "haider@example.com",
      password: "supersecurepw",
      role: "BEEKEEPER",
    });
    expect(result.role).toBe("BEEKEEPER");
  });

  it("rejects a password shorter than 8 chars", () => {
    expect(() =>
      UserCreateSchema.parse({
        name: "Haider Ali",
        email: "haider@example.com",
        password: "short",
        role: "BEEKEEPER",
      })
    ).toThrow();
  });

  it("rejects an invalid email", () => {
    expect(() =>
      UserCreateSchema.parse({
        name: "Haider Ali",
        email: "not-an-email",
        password: "supersecurepw",
        role: "BEEKEEPER",
      })
    ).toThrow();
  });
});

describe("HiveSchema", () => {
  it("rejects a non-uuid apiaryId", () => {
    expect(() =>
      HiveSchema.parse({
        id: crypto.randomUUID(),
        apiaryId: "not-a-uuid",
        hiveCode: "HIVE-001",
        status: "ACTIVE",
        createdAt: new Date(),
      })
    ).toThrow();
  });
});

describe("SupplyChainEventCreateSchema", () => {
  it("rejects an event with neither batchId nor bottleId", () => {
    expect(() =>
      SupplyChainEventCreateSchema.parse({ eventType: "HARVESTED" })
    ).toThrow();
  });

  it("accepts a valid event with batchId", () => {
    const result = SupplyChainEventCreateSchema.parse({
      batchId: crypto.randomUUID(),
      eventType: "PACKED",
    });
    expect(result.eventType).toBe("PACKED");
  });
});

describe("ScratchVerifySchema", () => {
  it("rejects a scratch code shorter than 6 chars", () => {
    expect(() =>
      ScratchVerifySchema.parse({
        qrToken: "a".repeat(24),
        scratchCode: "abc",
      })
    ).toThrow();
  });

  it("accepts a valid token + scratch pair", () => {
    const result = ScratchVerifySchema.parse({
      qrToken: "a".repeat(24),
      scratchCode: "SCR1234",
    });
    expect(result.scratchCode).toBe("SCR1234");
  });
});

describe("VerificationOutcomeSchema", () => {
  it("only allows GREEN / YELLOW / RED", () => {
    expect(VerificationOutcomeSchema.parse("YELLOW")).toBe("YELLOW");
    expect(() => VerificationOutcomeSchema.parse("BLUE")).toThrow();
  });
});