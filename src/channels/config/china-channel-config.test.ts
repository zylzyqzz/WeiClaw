import { describe, expect, it } from "vitest";
import { loadChinaChannelConfig } from "./china-channel-config.js";

describe("loadChinaChannelConfig", () => {
  it("loads disabled defaults with normalized webhook paths", () => {
    const config = loadChinaChannelConfig({});

    expect(config.wecom.enabled).toBe(false);
    expect(config.wecom.webhookPath).toBe("/channels/wecom/webhook");
    expect(config.feishu.enabled).toBe(false);
    expect(config.feishu.webhookPath).toBe("/channels/feishu/webhook");
  });

  it("loads enabled WeCom and Feishu values from env", () => {
    const config = loadChinaChannelConfig({
      WEICLAW_WECOM_ENABLED: "true",
      WEICLAW_WECOM_CORP_ID: "corp-1",
      WEICLAW_WECOM_CORP_SECRET: "secret-1",
      WEICLAW_WECOM_AGENT_ID: "agent-1",
      WEICLAW_WECOM_TOKEN: "token-1",
      WEICLAW_WECOM_ENCODING_AES_KEY: "aes-1",
      WEICLAW_WECOM_WEBHOOK_PATH: "wecom-hook",
      WEICLAW_FEISHU_ENABLED: "1",
      WEICLAW_FEISHU_APP_ID: "app-1",
      WEICLAW_FEISHU_APP_SECRET: "secret-2",
      WEICLAW_FEISHU_VERIFICATION_TOKEN: "verify-1",
      WEICLAW_FEISHU_ENCRYPT_KEY: "encrypt-1",
      WEICLAW_FEISHU_WEBHOOK_PATH: "feishu-hook",
    } as NodeJS.ProcessEnv);

    expect(config.wecom).toMatchObject({
      enabled: true,
      corpId: "corp-1",
      corpSecret: "secret-1",
      agentId: "agent-1",
      token: "token-1",
      encodingAESKey: "aes-1",
      webhookPath: "/wecom-hook",
    });
    expect(config.feishu).toMatchObject({
      enabled: true,
      appId: "app-1",
      appSecret: "secret-2",
      verificationToken: "verify-1",
      encryptKey: "encrypt-1",
      webhookPath: "/feishu-hook",
    });
  });
});
