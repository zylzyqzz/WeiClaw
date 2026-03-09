import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildCoreBridgeInboundEventFromChinaEvent,
  buildCoreBridgeInboundEventFromTemplateContext,
  handoffCoreBridgeEvent,
} from "./runtime-bridge.js";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("core bridge runtime handoff", () => {
  it("does not block mainline when bridge is disabled", async () => {
    const logger = {
      log: vi.fn(),
      error: vi.fn(),
    };
    const result = await handoffCoreBridgeEvent({
      source: "test",
      logger,
      env: {
        WEICLAW_CORE_BRIDGE_ENABLED: "false",
      },
      event: {
        providerKey: "telegram",
        externalUserId: "u1",
        externalChatId: "c1",
        messageId: "m1",
        messageType: "message.text",
        text: "hello",
        receivedAt: new Date().toISOString(),
        metadata: {},
      },
    });
    expect(result.handledByCore).toBe(false);
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining("bridge disabled"));
  });

  it("posts normalized payload in http mode", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        accepted: true,
        handledByCore: true,
        context: {
          resolved: true,
          ownerRef: "owner-1",
          agentRef: "agent-1",
          memoryNamespaces: ["default"],
          notes: ["ok"],
        },
        error: null,
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const event = {
      providerKey: "feishu" as const,
      externalUserId: "u2",
      externalChatId: "chat-2",
      messageId: "m2",
      messageType: "message.text",
      text: "hello from feishu",
      receivedAt: new Date().toISOString(),
      metadata: { source: "test" },
    };
    const result = await handoffCoreBridgeEvent({
      source: "feishu-test",
      env: {
        WEICLAW_CORE_BRIDGE_ENABLED: "true",
        WEICLAW_CORE_BRIDGE_MODE: "http",
        WEICLAW_CORE_BRIDGE_ENDPOINT: "http://127.0.0.1:18999/core-bridge",
        WEICLAW_CORE_BRIDGE_TIMEOUT_MS: "2000",
      },
      event,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:18999/core-bridge",
      expect.objectContaining({
        method: "POST",
      }),
    );
    const request = fetchMock.mock.calls[0]?.[1] as { body?: string };
    expect(request.body).toContain('"providerKey":"feishu"');
    expect(request.body).toContain('"externalUserId":"u2"');
    expect(result.handledByCore).toBe(true);
  });

  it("falls back on bridge timeout or error", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("timeout")) as unknown as typeof fetch;
    const logger = {
      log: vi.fn(),
      error: vi.fn(),
    };
    const result = await handoffCoreBridgeEvent({
      source: "timeout-test",
      logger,
      env: {
        WEICLAW_CORE_BRIDGE_ENABLED: "true",
        WEICLAW_CORE_BRIDGE_MODE: "http",
        WEICLAW_CORE_BRIDGE_ENDPOINT: "http://127.0.0.1:18999/core-bridge",
        WEICLAW_CORE_BRIDGE_TIMEOUT_MS: "10",
      },
      event: {
        providerKey: "wecom",
        externalUserId: "u3",
        externalChatId: "chat-3",
        messageId: "m3",
        messageType: "message.text",
        text: "hello",
        receivedAt: new Date().toISOString(),
        metadata: {},
      },
    });
    expect(result.handledByCore).toBe(false);
    expect(result.error).toBe("timeout");
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("bridge error"));
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining("bridge fallback"));
  });

  it("builds inbound event from China channel event", () => {
    const event = buildCoreBridgeInboundEventFromChinaEvent({
      channel: "wecom",
      eventType: "message.text",
      message: {
        channel: "wecom",
        senderId: "wx-user-1",
        conversationId: "room-1",
        text: "hello",
        timestamp: "2026-03-09T00:00:00.000Z",
        raw: {},
      },
      raw: { hello: "world" },
    });
    expect(event.providerKey).toBe("wecom");
    expect(event.externalUserId).toBe("wx-user-1");
    expect(event.externalChatId).toBe("room-1");
  });

  it("builds inbound event from Telegram runtime context", () => {
    const event = buildCoreBridgeInboundEventFromTemplateContext({
      providerKey: "telegram",
      commandBody: "remember this",
      context: {
        SenderId: "tg-user-1",
        To: "tg-chat-1",
        MessageSid: "tg-msg-1",
        Timestamp: Date.parse("2026-03-09T00:00:00.000Z"),
      },
    });
    expect(event.providerKey).toBe("telegram");
    expect(event.externalUserId).toBe("tg-user-1");
    expect(event.externalChatId).toBe("tg-chat-1");
    expect(event.messageId).toBe("tg-msg-1");
  });
});
