import { resolveWebhookPath } from "../../plugin-sdk/webhook-path.js";
import type { FeishuChannelConfig } from "../feishu/config.js";
import type { WeComChannelConfig } from "../wecom/config.js";

function isEnabled(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

export type ChinaChannelConfig = {
  wecom: WeComChannelConfig;
  feishu: FeishuChannelConfig;
};

export function loadChinaChannelConfig(env: NodeJS.ProcessEnv = process.env): ChinaChannelConfig {
  return {
    wecom: {
      corpId: env.WEICLAW_WECOM_CORP_ID ?? "",
      corpSecret: env.WEICLAW_WECOM_CORP_SECRET ?? "",
      agentId: env.WEICLAW_WECOM_AGENT_ID ?? "",
      token: env.WEICLAW_WECOM_TOKEN ?? "",
      encodingAESKey: env.WEICLAW_WECOM_ENCODING_AES_KEY ?? "",
      webhookPath: resolveWebhookPath({
        webhookPath: env.WEICLAW_WECOM_WEBHOOK_PATH,
        defaultPath: "/channels/wecom/webhook",
      })!,
      enabled: isEnabled(env.WEICLAW_WECOM_ENABLED),
    },
    feishu: {
      appId: env.WEICLAW_FEISHU_APP_ID ?? "",
      appSecret: env.WEICLAW_FEISHU_APP_SECRET ?? "",
      verificationToken: env.WEICLAW_FEISHU_VERIFICATION_TOKEN ?? "",
      encryptKey: env.WEICLAW_FEISHU_ENCRYPT_KEY ?? "",
      webhookPath: resolveWebhookPath({
        webhookPath: env.WEICLAW_FEISHU_WEBHOOK_PATH,
        defaultPath: "/channels/feishu/webhook",
      })!,
      enabled: isEnabled(env.WEICLAW_FEISHU_ENABLED),
    },
  };
}
