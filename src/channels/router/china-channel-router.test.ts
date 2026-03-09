import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as runtimeBridge from "../../core-bridge/runtime-bridge.js";
import { routeChinaChannelWebhook } from "./china-channel-router.js";

const enabledConfig = {
  wecom: {
    enabled: true,
    corpId: "corp-1",
    corpSecret: "secret-1",
    agentId: "agent-1",
    token: "token-1",
    encodingAESKey: "aes-1",
    webhookPath: "/channels/wecom/webhook",
  },
  feishu: {
    enabled: true,
    appId: "app-1",
    appSecret: "secret-2",
    verificationToken: "verify-1",
    encryptKey: "encrypt-1",
    webhookPath: "/channels/feishu/webhook",
  },
};

describe("routeChinaChannelWebhook", () => {
  beforeEach(() => {
    vi.spyOn(runtimeBridge, "handoffCoreBridgeEvent").mockResolvedValue({
      accepted: false,
      handledByCore: false,
      context: null,
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not match disabled channels by default", async () => {
    const result = await routeChinaChannelWebhook(
      {
        method: "POST",
        path: "/channels/wecom/webhook",
        headers: {},
        body: "<xml></xml>",
      },
      {
        wecom: { ...enabledConfig.wecom, enabled: false },
        feishu: { ...enabledConfig.feishu, enabled: false },
      },
    );

    expect(result).toEqual({ matched: false });
  });

  it("routes a WeCom text webhook into the shared message shape", async () => {
    const result = await routeChinaChannelWebhook(
      {
        method: "POST",
        path: "/channels/wecom/webhook",
        headers: {},
        body: "<xml><ToUserName><![CDATA[bot]]></ToUserName><FromUserName><![CDATA[user-1]]></FromUserName><CreateTime>1710000000</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[hello]]></Content></xml>",
      },
      enabledConfig,
    );

    expect(result.matched).toBe(true);
    expect(result.channel).toBe("wecom");
    expect(result.event?.eventType).toBe("message.text");
    expect(result.event?.message?.text).toBe("hello");
    expect(result.response?.statusCode).toBe(200);
    expect(result.response?.contentType).toBe("application/xml");
    expect(runtimeBridge.handoffCoreBridgeEvent).toHaveBeenCalledTimes(1);
    expect(runtimeBridge.handoffCoreBridgeEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "channels:wecom",
      }),
    );
  });

  it("routes a Feishu url verification request and echoes challenge", async () => {
    const result = await routeChinaChannelWebhook(
      {
        method: "POST",
        path: "/channels/feishu/webhook",
        headers: {},
        body: JSON.stringify({
          type: "url_verification",
          challenge: "challenge-1",
        }),
      },
      enabledConfig,
    );

    expect(result.matched).toBe(true);
    expect(result.channel).toBe("feishu");
    expect(result.event?.eventType).toBe("url_verification");
    expect(result.response?.statusCode).toBe(200);
    expect(result.response?.body).toContain("challenge-1");
    expect(runtimeBridge.handoffCoreBridgeEvent).toHaveBeenCalledTimes(1);
    expect(runtimeBridge.handoffCoreBridgeEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "channels:feishu",
      }),
    );
  });
});
