import { describe, expect, it } from "vitest";
import {
  consumeBridgeContext,
  createBridgeContextConsumptionLog,
  shouldGracefulDegrade,
} from "./context-consumer.js";
import type { CoreBridgeResult, CoreBridgeResolvedContext } from "./types.js";

describe("context-consumer", () => {
  describe("consumeBridgeContext", () => {
    it("returns default when context is null", () => {
      const result: CoreBridgeResult = {
        accepted: false,
        handledByCore: false,
        context: null,
        error: null,
      };
      const consumption = consumeBridgeContext(result);
      expect(consumption.consumed).toBe(false);
      expect(consumption.resolutionState).toBeNull();
      expect(consumption.namespaceHints).toEqual([]);
    });

    it("returns default when not accepted", () => {
      const result: CoreBridgeResult = {
        accepted: false,
        handledByCore: false,
        context: null,
        error: null,
      };
      const consumption = consumeBridgeContext(result);
      expect(consumption.consumed).toBe(false);
    });

    it("consumes resolved context with namespace hints", () => {
      const context: CoreBridgeResolvedContext = {
        resolutionState: "resolved",
        provisioningSummary: {
          deviceBound: true,
          claimRequired: false,
          ownerKnown: true,
          agentReady: true,
          memoryReady: true,
        },
        namespaceHints: ["user-ns-1", "user-ns-2"],
        ownerRef: "owner-1",
        agentRef: "agent-1",
        memoryNamespaces: ["default"],
        notes: ["context resolved successfully"],
      };
      const result: CoreBridgeResult = {
        accepted: true,
        handledByCore: true,
        context,
        error: null,
      };
      const consumption = consumeBridgeContext(result);
      expect(consumption.consumed).toBe(true);
      expect(consumption.resolutionState).toBe("resolved");
      expect(consumption.namespaceHints).toEqual(["user-ns-1", "user-ns-2"]);
      expect(consumption.memoryNamespaces).toEqual(["default"]);
      expect(consumption.notes).toEqual(["context resolved successfully"]);
      expect(consumption.ownerRef).toBe("owner-1");
      expect(consumption.agentRef).toBe("agent-1");
    });

    it("handles unclaimed_device state", () => {
      const context: CoreBridgeResolvedContext = {
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
      };
      const result: CoreBridgeResult = {
        accepted: true,
        handledByCore: true,
        context,
        error: null,
      };
      const consumption = consumeBridgeContext(result);
      expect(consumption.consumed).toBe(true);
      expect(consumption.resolutionState).toBe("unclaimed_device");
      expect(consumption.namespaceHints).toEqual([]);
    });

    it("handles error state", () => {
      const context: CoreBridgeResolvedContext = {
        resolutionState: "error",
        provisioningSummary: null,
        namespaceHints: [],
        ownerRef: null,
        agentRef: null,
        memoryNamespaces: [],
        notes: ["bridge error: timeout"],
      };
      const result: CoreBridgeResult = {
        accepted: true,
        handledByCore: false,
        context,
        error: "timeout",
      };
      const consumption = consumeBridgeContext(result);
      expect(consumption.consumed).toBe(true);
      expect(consumption.resolutionState).toBe("error");
    });

    it("handles resolved state as string", () => {
      const context: CoreBridgeResolvedContext = {
        resolutionState: "resolved",
        provisioningSummary: null,
        namespaceHints: [],
        ownerRef: "owner-1",
        agentRef: null,
        memoryNamespaces: ["default"],
        notes: [],
      };
      const result: CoreBridgeResult = {
        accepted: true,
        handledByCore: true,
        context,
        error: null,
      };
      const consumption = consumeBridgeContext(result);
      expect(consumption.resolutionState).toBe("resolved");
    });
  });

  describe("createBridgeContextConsumptionLog", () => {
    it("logs handoff attempted and response received", () => {
      const context: CoreBridgeResolvedContext = {
        resolutionState: "resolved",
        provisioningSummary: null,
        namespaceHints: [],
        ownerRef: null,
        agentRef: null,
        memoryNamespaces: [],
        notes: [],
      };
      const result: CoreBridgeResult = {
        accepted: true,
        handledByCore: true,
        context,
        error: null,
      };
      const log = createBridgeContextConsumptionLog({
        handoffAttempted: true,
        result,
      });
      expect(log.handoffAttempted).toBe(true);
      expect(log.bridgeResponseReceived).toBe(true);
      expect(log.bridgeContextConsumed).toBe(true);
      expect(log.bridgeFallback).toBe(false);
    });

    it("logs fallback when not accepted", () => {
      const result: CoreBridgeResult = {
        accepted: false,
        handledByCore: false,
        context: null,
        error: null,
      };
      const log = createBridgeContextConsumptionLog({
        handoffAttempted: true,
        result,
      });
      expect(log.bridgeFallback).toBe(true);
    });

    it("logs fallback when error", () => {
      const result: CoreBridgeResult = {
        accepted: false,
        handledByCore: false,
        context: null,
        error: "network error",
      };
      const log = createBridgeContextConsumptionLog({
        handoffAttempted: true,
        result,
      });
      expect(log.bridgeFallback).toBe(true);
    });

    it("logs fallback for unclaimed_device", () => {
      const context: CoreBridgeResolvedContext = {
        resolutionState: "unclaimed_device",
        provisioningSummary: null,
        namespaceHints: [],
        ownerRef: null,
        agentRef: null,
        memoryNamespaces: [],
        notes: [],
      };
      const result: CoreBridgeResult = {
        accepted: true,
        handledByCore: true,
        context,
        error: null,
      };
      const log = createBridgeContextConsumptionLog({
        handoffAttempted: true,
        result,
      });
      expect(log.bridgeFallback).toBe(true);
      expect(log.resolutionState).toBe("unclaimed_device");
    });
  });

  describe("shouldGracefulDegrade", () => {
    it("returns true for unclaimed_device", () => {
      expect(shouldGracefulDegrade("unclaimed_device")).toBe(true);
    });

    it("returns true for claim_required", () => {
      expect(shouldGracefulDegrade("claim_required")).toBe(true);
    });

    it("returns true for error", () => {
      expect(shouldGracefulDegrade("error")).toBe(true);
    });

    it("returns false for resolved", () => {
      expect(shouldGracefulDegrade("resolved")).toBe(false);
    });

    it("returns false for unresolved", () => {
      expect(shouldGracefulDegrade("unresolved")).toBe(false);
    });

    it("returns false for null", () => {
      expect(shouldGracefulDegrade(null)).toBe(false);
    });
  });
});
