import type { TemplateContext } from "../auto-reply/templating.js";
import type { ChannelInboundEvent } from "../channels/shared/types.js";
import { loadCoreBridgeConfig, type CoreBridgeConfig } from "./bridge-config.js";
import { runNoopCoreBridge } from "./noop-bridge.js";
import type { CoreBridgeInboundEvent, CoreBridgeResult, CoreBridgeRuntimeLogger } from "./types.js";

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function createAbortSignal(timeoutMs: number): AbortSignal {
  const signalFactory = (AbortSignal as unknown as { timeout?: (ms: number) => AbortSignal })
    .timeout;
  if (typeof signalFactory === "function") {
    return signalFactory(timeoutMs);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs).unref?.();
  return controller.signal;
}

async function runHttpCoreBridge(
  event: CoreBridgeInboundEvent,
  config: CoreBridgeConfig,
): Promise<CoreBridgeResult> {
  if (!config.endpoint) {
    throw new Error("missing core bridge endpoint");
  }
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(event),
    signal: createAbortSignal(config.timeoutMs),
  });
  if (!response.ok) {
    throw new Error(`bridge http ${response.status}`);
  }
  const payload = (await response.json()) as Partial<CoreBridgeResult>;
  return {
    accepted: payload.accepted === true,
    handledByCore: payload.handledByCore === true,
    context: payload.context ?? null,
    error: payload.error ?? null,
  };
}

export function buildCoreBridgeInboundEventFromChinaEvent(
  event: ChannelInboundEvent,
): CoreBridgeInboundEvent {
  const message = event.message;
  return {
    providerKey: event.channel,
    externalUserId: message?.senderId?.trim() || "unknown-user",
    externalChatId: message?.conversationId?.trim() || null,
    messageId: `${event.channel}:${message?.timestamp ?? Date.now()}`,
    messageType: event.eventType,
    text: message?.text?.trim() ?? "",
    receivedAt: message?.timestamp ?? new Date().toISOString(),
    metadata: {
      source: "channels:china-router",
      raw: event.raw,
    },
  };
}

export function buildCoreBridgeInboundEventFromTemplateContext(params: {
  providerKey: "telegram" | "wecom" | "feishu";
  commandBody: string;
  context: TemplateContext;
}): CoreBridgeInboundEvent {
  const context = params.context;
  return {
    providerKey: params.providerKey,
    externalUserId: context.SenderId?.trim() || "unknown-user",
    externalChatId: context.OriginatingTo?.trim() || context.To?.trim() || null,
    messageId:
      context.MessageSidFull?.trim() || context.MessageSid?.trim() || `runtime:${Date.now()}`,
    messageType: "message.text",
    text: params.commandBody.trim(),
    receivedAt:
      typeof context.Timestamp === "number"
        ? new Date(context.Timestamp).toISOString()
        : new Date().toISOString(),
    metadata: {
      source: "runtime:agent-runner",
      sessionKey: context.SessionKey ?? null,
      surface: context.Surface ?? context.Provider ?? null,
      rawMessageIds: context.MessageSids ?? [],
    },
  };
}

export async function handoffCoreBridgeEvent(params: {
  event: CoreBridgeInboundEvent;
  source: string;
  env?: NodeJS.ProcessEnv;
  logger?: CoreBridgeRuntimeLogger;
}): Promise<CoreBridgeResult> {
  const config = loadCoreBridgeConfig(params.env);
  const logger = params.logger;

  if (!config.enabled) {
    logger?.log(`[core-bridge] bridge disabled source=${params.source}`);
    return {
      accepted: false,
      handledByCore: false,
      context: null,
      error: null,
    };
  }

  logger?.log(`[core-bridge] bridge attempted source=${params.source} mode=${config.mode}`);
  try {
    const result =
      config.mode === "http"
        ? await runHttpCoreBridge(params.event, config)
        : await runNoopCoreBridge(params.event);
    if (result.handledByCore) {
      logger?.log(`[core-bridge] bridge success source=${params.source}`);
    } else {
      logger?.log(`[core-bridge] bridge fallback source=${params.source} reason=not-handled`);
    }
    return result;
  } catch (error) {
    const message = toErrorMessage(error);
    logger?.error(`[core-bridge] bridge error source=${params.source} error=${message}`);
    logger?.log(`[core-bridge] bridge fallback source=${params.source} reason=error`);
    return {
      accepted: false,
      handledByCore: false,
      context: null,
      error: message,
    };
  }
}

export async function claimCoreBridgeDevice(params: {
  providerKey: string;
  externalUserId: string;
  activationCode: string;
  env?: NodeJS.ProcessEnv;
  logger?: CoreBridgeRuntimeLogger;
}): Promise<CoreBridgeResult> {
  const config = loadCoreBridgeConfig(params.env);
  const logger = params.logger;

  if (!config.enabled || config.mode !== "http" || !config.endpoint) {
    return {
      accepted: false,
      handledByCore: false,
      context: null,
      error: "bridge disabled or not in http mode",
    };
  }

  const claimEndpoint = config.endpoint.replace(/\/inbound$/, "/claim");

  try {
    const response = await fetch(claimEndpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        providerKey: params.providerKey,
        externalUserId: params.externalUserId,
        activationCode: params.activationCode,
      }),
      signal: createAbortSignal(config.timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`bridge claim http ${response.status}`);
    }

    const payload = (await response.json()) as Partial<CoreBridgeResult>;
    return {
      accepted: payload.accepted === true,
      handledByCore: payload.handledByCore === true,
      context: payload.context ?? null,
      error: payload.error ?? null,
    };
  } catch (error) {
    const message = toErrorMessage(error);
    logger?.error(`[core-bridge] bridge claim error error=${message}`);
    return {
      accepted: false,
      handledByCore: false,
      context: null,
      error: message,
    };
  }
}
