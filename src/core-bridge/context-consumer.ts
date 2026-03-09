import type {
  CoreBridgeResult,
  CoreBridgeResolvedContext,
  CoreBridgeResolutionState,
} from "./types.js";

export type BridgeContextConsumptionResult = {
  consumed: boolean;
  resolutionState: CoreBridgeResolutionState | null;
  namespaceHints: string[];
  memoryNamespaces: string[];
  notes: string[];
  ownerRef: string | null;
  agentRef: string | null;
};

export type BridgeContextConsumptionLog = {
  handoffAttempted: boolean;
  bridgeResponseReceived: boolean;
  bridgeContextConsumed: boolean;
  bridgeFallback: boolean;
  resolutionState: CoreBridgeResolutionState | null;
  notes: string[];
};

function extractResolutionState(context: CoreBridgeResolvedContext | null): CoreBridgeResolutionState | null {
  if (!context) {
    return null;
  }
  return context.resolutionState ?? "unresolved";
}

export function consumeBridgeContext(result: CoreBridgeResult): BridgeContextConsumptionResult {
  const context = result.context;

  if (!context || !result.accepted) {
    return {
      consumed: false,
      resolutionState: null,
      namespaceHints: [],
      memoryNamespaces: [],
      notes: [],
      ownerRef: null,
      agentRef: null,
    };
  }

  const resolutionState = extractResolutionState(context);

  return {
    consumed: true,
    resolutionState,
    namespaceHints: context.namespaceHints ?? [],
    memoryNamespaces: context.memoryNamespaces ?? [],
    notes: context.notes ?? [],
    ownerRef: context.ownerRef ?? null,
    agentRef: context.agentRef ?? null,
  };
}

export function createBridgeContextConsumptionLog(params: {
  handoffAttempted: boolean;
  result: CoreBridgeResult;
}): BridgeContextConsumptionLog {
  const { handoffAttempted, result } = params;

  const bridgeResponseReceived = handoffAttempted && result.context !== null;
  const context = result.context;
  const resolutionState = extractResolutionState(context);

  let bridgeFallback = false;
  let bridgeContextConsumed = false;

  if (handoffAttempted) {
    if (result.error) {
      bridgeFallback = true;
    } else if (!result.accepted) {
      bridgeFallback = true;
    } else if (context) {
      bridgeContextConsumed = true;
      if (
        resolutionState === "unclaimed_device" ||
        resolutionState === "claim_required" ||
        resolutionState === "error"
      ) {
        bridgeFallback = true;
      }
    }
  }

  return {
    handoffAttempted,
    bridgeResponseReceived,
    bridgeContextConsumed,
    bridgeFallback,
    resolutionState,
    notes: context?.notes ?? [],
  };
}

export function shouldGracefulDegrade(resolutionState: CoreBridgeResolutionState | null): boolean {
  if (!resolutionState) {
    return false;
  }
  return (
    resolutionState === "unclaimed_device" ||
    resolutionState === "claim_required" ||
    resolutionState === "error"
  );
}
