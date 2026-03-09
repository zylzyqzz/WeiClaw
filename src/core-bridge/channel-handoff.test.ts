import { afterEach, describe, expect, it, vi } from "vitest";
import type { TemplateContext } from "../auto-reply/templating.js";
import * as runtimeBridge from "./runtime-bridge.js";
import {
  handoffRuntimeCoreBridgeContext,
  resolveCoreBridgeProviderFromContext,
} from "./channel-handoff.js";

function createContext(overrides: Partial<TemplateContext> = {}): TemplateContext {
  return {
    Surface: "telegram",
    SenderId: "user-1",
    OriginatingTo: "chat-1",
    MessageSid: "msg-1",
    ...overrides,
  } as TemplateContext;
}

describe("core bridge channel handoff", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves telegram provider from runtime context", () => {
    const provider = resolveCoreBridgeProviderFromContext(createContext({ Surface: "telegram" }));
    expect(provider).toBe("telegram");
  });

  it("hands off telegram runtime event to core bridge", async () => {
    const handoffSpy = vi.spyOn(runtimeBridge, "handoffCoreBridgeEvent").mockResolvedValue({
      accepted: false,
      handledByCore: false,
      context: null,
      error: null,
    });

    await handoffRuntimeCoreBridgeContext({
      commandBody: "hello from telegram",
      context: createContext({ Surface: "telegram", SenderId: "tg-user-1" }),
    });

    expect(handoffSpy).toHaveBeenCalledTimes(1);
    expect(handoffSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "runtime:telegram",
        event: expect.objectContaining({
          providerKey: "telegram",
          externalUserId: "tg-user-1",
        }),
      }),
    );
  });

  it("skips handoff for unsupported providers", async () => {
    const handoffSpy = vi.spyOn(runtimeBridge, "handoffCoreBridgeEvent").mockResolvedValue({
      accepted: false,
      handledByCore: false,
      context: null,
      error: null,
    });

    await handoffRuntimeCoreBridgeContext({
      commandBody: "ignore me",
      context: createContext({ Surface: "discord" }),
    });

    expect(handoffSpy).not.toHaveBeenCalled();
  });
});
