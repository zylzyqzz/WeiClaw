import type { CoreBridgeInboundEvent, CoreBridgeResult } from "./types.js";

export async function runNoopCoreBridge(_event: CoreBridgeInboundEvent): Promise<CoreBridgeResult> {
  return {
    accepted: true,
    handledByCore: false,
    context: null,
    error: null,
  };
}
