import { describe, expect, it } from "vitest";
import type { BridgeContextConsumptionResult } from "../../core-bridge/context-consumer.js";
import { extractBridgeMemoryHints, mergeNamespaceHints } from "./bridge-memory-hints.js";

describe("bridge-memory-hints", () => {
  describe("extractBridgeMemoryHints", () => {
    it("returns default when not consumed", () => {
      const consumption: BridgeContextConsumptionResult = {
        consumed: false,
        resolutionState: null,
        namespaceHints: [],
        memoryNamespaces: [],
        notes: [],
        ownerRef: null,
        agentRef: null,
      };
      const hints = extractBridgeMemoryHints(consumption);
      expect(hints.namespaces).toEqual([]);
      expect(hints.isHintOnly).toBe(true);
      expect(hints.source).toBe("default");
    });

    it("returns default when resolutionState is null", () => {
      const consumption: BridgeContextConsumptionResult = {
        consumed: true,
        resolutionState: null,
        namespaceHints: [],
        memoryNamespaces: [],
        notes: [],
        ownerRef: null,
        agentRef: null,
      };
      const hints = extractBridgeMemoryHints(consumption);
      expect(hints.namespaces).toEqual([]);
      expect(hints.source).toBe("default");
    });

    it("uses namespaceHints when provided", () => {
      const consumption: BridgeContextConsumptionResult = {
        consumed: true,
        resolutionState: "resolved",
        namespaceHints: ["user-ns-1", "user-ns-2"],
        memoryNamespaces: ["default"],
        notes: [],
        ownerRef: "owner-1",
        agentRef: "agent-1",
      };
      const hints = extractBridgeMemoryHints(consumption);
      expect(hints.namespaces).toEqual(["user-ns-1", "user-ns-2"]);
      expect(hints.isHintOnly).toBe(true);
      expect(hints.source).toBe("bridge");
    });

    it("falls back to memoryNamespaces when no namespaceHints", () => {
      const consumption: BridgeContextConsumptionResult = {
        consumed: true,
        resolutionState: "resolved",
        namespaceHints: [],
        memoryNamespaces: ["mem-ns-1"],
        notes: [],
        ownerRef: null,
        agentRef: null,
      };
      const hints = extractBridgeMemoryHints(consumption);
      expect(hints.namespaces).toEqual(["mem-ns-1"]);
      expect(hints.isHintOnly).toBe(false);
      expect(hints.source).toBe("bridge");
    });

    it("returns default for unresolved state", () => {
      const consumption: BridgeContextConsumptionResult = {
        consumed: true,
        resolutionState: "unresolved",
        namespaceHints: [],
        memoryNamespaces: [],
        notes: [],
        ownerRef: null,
        agentRef: null,
      };
      const hints = extractBridgeMemoryHints(consumption);
      expect(hints.namespaces).toEqual([]);
      expect(hints.source).toBe("default");
    });

    it("returns default for unclaimed_device state", () => {
      const consumption: BridgeContextConsumptionResult = {
        consumed: true,
        resolutionState: "unclaimed_device",
        namespaceHints: [],
        memoryNamespaces: [],
        notes: ["device not bound"],
        ownerRef: null,
        agentRef: null,
      };
      const hints = extractBridgeMemoryHints(consumption);
      expect(hints.namespaces).toEqual([]);
      expect(hints.source).toBe("default");
    });
  });

  describe("mergeNamespaceHints", () => {
    it("returns default namespace when no hints", () => {
      const result = mergeNamespaceHints({
        bridgeHints: { namespaces: [], isHintOnly: true, source: "default" },
        defaultNamespace: "default",
      });
      expect(result).toEqual(["default"]);
    });

    it("includes both bridge hints and default", () => {
      const result = mergeNamespaceHints({
        bridgeHints: { namespaces: ["user-ns-1"], isHintOnly: true, source: "bridge" },
        defaultNamespace: "default",
      });
      expect(result).toEqual(["user-ns-1", "default"]);
    });

    it("deduplicates namespaces", () => {
      const result = mergeNamespaceHints({
        bridgeHints: { namespaces: ["default", "user-ns-1"], isHintOnly: true, source: "bridge" },
        defaultNamespace: "default",
      });
      expect(result).toEqual(["default", "user-ns-1"]);
    });

    it("handles empty bridge hints", () => {
      const result = mergeNamespaceHints({
        bridgeHints: { namespaces: [], isHintOnly: true, source: "default" },
        defaultNamespace: "my-ns",
      });
      expect(result).toEqual(["my-ns"]);
    });
  });
});
