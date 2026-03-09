import type { TemplateContext } from "../auto-reply/templating.js";
import type { CoreBridgeRuntimeLogger } from "./types.js";
import {
  buildCoreBridgeInboundEventFromTemplateContext,
  handoffCoreBridgeEvent,
} from "./runtime-bridge.js";

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
}): Promise<void> {
  const provider = resolveCoreBridgeProviderFromContext(params.context);
  if (!provider) {
    return;
  }
  await handoffCoreBridgeEvent({
    source: `runtime:${provider}`,
    logger: params.logger,
    env: params.env,
    event: buildCoreBridgeInboundEventFromTemplateContext({
      providerKey: provider,
      commandBody: params.commandBody,
      context: params.context,
    }),
  });
}
