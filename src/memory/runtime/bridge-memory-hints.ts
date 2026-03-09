import type { BridgeContextConsumptionResult } from "../../core-bridge/context-consumer.js";

export type BridgeMemoryHints = {
  namespaces: string[];
  isHintOnly: boolean;
  source: "bridge" | "default";
};

export function extractBridgeMemoryHints(
  consumption: BridgeContextConsumptionResult,
): BridgeMemoryHints {
  if (!consumption.consumed || !consumption.resolutionState) {
    return {
      namespaces: [],
      isHintOnly: true,
      source: "default",
    };
  }

  const { resolutionState, namespaceHints, memoryNamespaces } = consumption;

  if (resolutionState !== "resolved") {
    return {
      namespaces: [],
      isHintOnly: true,
      source: "default",
    };
  }

  const namespaces = namespaceHints.length > 0 ? namespaceHints : memoryNamespaces;

  return {
    namespaces,
    isHintOnly: namespaceHints.length > 0,
    source: "bridge",
  };
}

export function mergeNamespaceHints(params: {
  bridgeHints: BridgeMemoryHints;
  defaultNamespace: string;
}): string[] {
  const { bridgeHints, defaultNamespace } = params;

  if (bridgeHints.namespaces.length === 0) {
    return [defaultNamespace];
  }

  const uniqueNamespaces = [...new Set([...bridgeHints.namespaces, defaultNamespace])];
  return uniqueNamespaces;
}
