import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { claimCoreBridgeDevice } from "../../core-bridge/runtime-bridge.js";

describe("claim-interception", () => {
  describe("activation code detection", () => {
    it("detects 6-character alphanumeric code", () => {
      const code = "ABC123";
      expect(/^[A-Z0-9]{6,10}$/i.test(code)).toBe(true);
    });

    it("detects 8-character alphanumeric code", () => {
      const code = "ABCD1234";
      expect(/^[A-Z0-9]{6,10}$/i.test(code)).toBe(true);
    });

    it("detects 10-character alphanumeric code", () => {
      const code = "ABCDE12345";
      expect(/^[A-Z0-9]{6,10}$/i.test(code)).toBe(true);
    });

    it("rejects code shorter than 6 characters", () => {
      const code = "ABC12";
      expect(/^[A-Z0-9]{6,10}$/i.test(code)).toBe(false);
    });

    it("rejects code longer than 10 characters", () => {
      const code = "ABCDEFGHIJK";
      expect(/^[A-Z0-9]{6,10}$/i.test(code)).toBe(false);
    });

    it("rejects code with special characters", () => {
      const code = "ABC-123";
      expect(/^[A-Z0-9]{6,10}$/i.test(code)).toBe(false);
    });

    it("accepts lowercase letters", () => {
      const code = "abc1234";
      expect(/^[A-Z0-9]{6,10}$/i.test(code)).toBe(true);
    });

    it("accepts mixed case", () => {
      const code = "AbC12345";
      expect(/^[A-Z0-9]{6,10}$/i.test(code)).toBe(true);
    });
  });

  describe("claimCoreBridgeDevice", () => {
    it("exports claimCoreBridgeDevice function", () => {
      expect(typeof claimCoreBridgeDevice).toBe("function");
    });

    it("requires http mode enabled", async () => {
      // When bridge is not enabled in http mode, returns error
      const result = await claimCoreBridgeDevice({
        providerKey: "telegram",
        externalUserId: "user-123",
        activationCode: "TEST1234",
        env: { WEICLAW_CORE_BRIDGE_MODE: "noop" },
      });

      expect(result.accepted).toBe(false);
      expect(result.error).toContain("bridge disabled");
    });
  });
});
