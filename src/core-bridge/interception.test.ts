import { describe, expect, it } from "vitest";
import type { CoreBridgeResult } from "./types.js";
import { shouldGracefulDegrade } from "./context-consumer.js";

describe("core-bridge interception", () => {
  describe("shouldGracefulDegrade", () => {
    it("should degrade for unclaimed_device", () => {
      expect(shouldGracefulDegrade("unclaimed_device")).toBe(true);
    });

    it("should degrade for claim_required", () => {
      expect(shouldGracefulDegrade("claim_required")).toBe(true);
    });

    it("should degrade for error", () => {
      expect(shouldGracefulDegrade("error")).toBe(true);
    });

    it("should not degrade for resolved", () => {
      expect(shouldGracefulDegrade("resolved")).toBe(false);
    });

    it("should not degrade for unresolved", () => {
      expect(shouldGracefulDegrade("unresolved")).toBe(false);
    });

    it("should not degrade for null", () => {
      expect(shouldGracefulDegrade(null)).toBe(false);
    });
  });

  describe("interception scenarios", () => {
    it("should intercept when resolutionState is unclaimed_device", () => {
      const result: CoreBridgeResult = {
        accepted: true,
        handledByCore: true,
        context: {
          resolutionState: "unclaimed_device",
          provisioningSummary: {
            deviceBound: false,
            claimRequired: true,
            ownerKnown: false,
            agentReady: false,
            memoryReady: false,
          },
          namespaceHints: [],
          ownerRef: null,
          agentRef: null,
          memoryNamespaces: [],
          notes: ["device not bound, claim required"],
        },
        error: null,
      };

      const shouldBlock = shouldGracefulDegrade(result.context?.resolutionState ?? null);
      expect(shouldBlock).toBe(true);
    });

    it("should intercept when resolutionState is claim_required", () => {
      const result: CoreBridgeResult = {
        accepted: true,
        handledByCore: true,
        context: {
          resolutionState: "claim_required",
          provisioningSummary: {
            deviceBound: false,
            claimRequired: true,
            ownerKnown: false,
            agentReady: false,
            memoryReady: false,
          },
          namespaceHints: [],
          ownerRef: null,
          agentRef: null,
          memoryNamespaces: [],
          notes: ["please claim device first"],
        },
        error: null,
      };

      const shouldBlock = shouldGracefulDegrade(result.context?.resolutionState ?? null);
      expect(shouldBlock).toBe(true);
    });

    it("should not intercept when resolutionState is resolved", () => {
      const result: CoreBridgeResult = {
        accepted: true,
        handledByCore: true,
        context: {
          resolutionState: "resolved",
          provisioningSummary: {
            deviceBound: true,
            claimRequired: false,
            ownerKnown: true,
            agentReady: true,
            memoryReady: true,
          },
          namespaceHints: ["user-ns-1"],
          ownerRef: "owner-1",
          agentRef: "agent-1",
          memoryNamespaces: ["default"],
          notes: ["context resolved successfully"],
        },
        error: null,
      };

      const shouldBlock = shouldGracefulDegrade(result.context?.resolutionState ?? null);
      expect(shouldBlock).toBe(false);
    });

    it("should not intercept when no bridge result", () => {
      const result: CoreBridgeResult = {
        accepted: false,
        handledByCore: false,
        context: null,
        error: null,
      };

      const shouldBlock = shouldGracefulDegrade(result.context?.resolutionState ?? null);
      expect(shouldBlock).toBe(false);
    });

    it("should extract provisioning notes for interception message", () => {
      const result: CoreBridgeResult = {
        accepted: true,
        handledByCore: true,
        context: {
          resolutionState: "claim_required",
          provisioningSummary: {
            deviceBound: false,
            claimRequired: true,
            ownerKnown: false,
            agentReady: false,
            memoryReady: false,
          },
          namespaceHints: [],
          ownerRef: null,
          agentRef: null,
          memoryNamespaces: [],
          notes: ["请先完成设备认主", "设备ID: device-123"],
        },
        error: null,
      };

      expect(result.context?.notes).toHaveLength(2);
      expect(result.context?.notes[0]).toContain("认主");
    });
  });
});
