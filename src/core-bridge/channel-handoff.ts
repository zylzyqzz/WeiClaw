import type { TemplateContext } from "../auto-reply/templating.js";
import type { CoreBridgeResult, CoreBridgeRuntimeLogger } from "./types.js";
import {
  buildCoreBridgeInboundEventFromTemplateContext,
  handoffCoreBridgeEvent,
} from "./runtime-bridge.js";
import { consumeBridgeContext, createBridgeContextConsumptionLog } from "./context-consumer.js";

export function resolveCoreBridgeProviderFromContext(
  context: TemplateContext,
): "telegram" | "wecom" | "feishu" | null {
  const provider = (context.Surface ?? context.Provider ?? "").trim().toLowerCase();
  if (provider === "telegram") {
    return "telegram";
  }
  if (provider === "wecom") {
    return "wecom";
  }
  if (provider === "feishu") {
    return "feishu";
  }
  return null;
}

export async function handoffRuntimeCoreBridgeContext(params: {
  commandBody: string;
  context: TemplateContext;
  logger?: CoreBridgeRuntimeLogger;
  env?: NodeJS.ProcessEnv;
}): Promise<CoreBridgeResult | null> {
  const provider = resolveCoreBridgeProviderFromContext(params.context);
  if (!provider) {
    return null;
  }
  const result = await handoffCoreBridgeEvent({
    source: `runtime:${provider}`,
    logger: params.logger,
    env: params.env,
    event: buildCoreBridgeInboundEventFromTemplateContext({
      providerKey: provider,
      commandBody: params.commandBody,
      context: params.context,
    }),
  });

  const consumptionLog = createBridgeContextConsumptionLog({
    handoffAttempted: true,
    result,
  });

  params.logger?.log(
    `[core-bridge] bridge response received resolutionState=${consumptionLog.resolutionState ?? "none"} consumed=${consumptionLog.bridgeContextConsumed}`,
  );

  if (consumptionLog.bridgeContextConsumed) {
    params.logger?.log(`[core-bridge] bridge context consumed hints=${consumptionLog.notes.join(", ") || "none"}`);
  }

  if (consumptionLog.bridgeFallback) {
    params.logger?.log(`[core-bridge] bridge fallback resolutionState=${consumptionLog.resolutionState}`);
  }

  return result;
}
