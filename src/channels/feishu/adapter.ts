import { normalizeWebhookPath } from "../../plugin-sdk/webhook-path.js";
import type {
  ChannelAdapter,
  ChannelHealthStatus,
  ChannelInboundEvent,
  ChannelWebhookRequest,
  ChannelWebhookResponse,
} from "../shared/types.js";
import type { FeishuChannelConfig } from "./config.js";
import { parseFeishuInboundEvent } from "./parser.js";

const REQUIRED_FIELDS: Array<keyof FeishuChannelConfig> = [
  "appId",
  "appSecret",
  "verificationToken",
  "encryptKey",
];

export const feishuAdapter: ChannelAdapter<FeishuChannelConfig> = {
  channel: "feishu",
  getHealthStatus(config): ChannelHealthStatus {
    const missingFields = REQUIRED_FIELDS.filter((field) => !String(config[field] ?? "").trim());
    const configured = missingFields.length === 0;
    return {
      channel: "feishu",
      enabled: config.enabled,
      configured,
      webhookPath: config.webhookPath,
      status: !config.enabled ? "disabled" : configured ? "ready" : "degraded",
      missingFields: config.enabled ? missingFields.map(String) : [],
      notes: [
        "v2.0.1 Feishu adapter skeleton only covers config, webhook route, text parse, and text reply formatting.",
      ],
    };
  },
  parseInboundEvent(
    request: ChannelWebhookRequest,
    config: FeishuChannelConfig,
  ): ChannelInboundEvent {
    if (!config.enabled) {
      throw new Error("Feishu adapter is disabled.");
    }
    return parseFeishuInboundEvent(request);
  },
  buildTextReply(event, text): ChannelWebhookResponse {
    if (event.eventType === "url_verification") {
      return {
        statusCode: 200,
        contentType: "application/json",
        body: JSON.stringify({ challenge: event.verificationChallenge ?? "" }),
      };
    }
    return {
      statusCode: 200,
      contentType: "application/json",
      body: JSON.stringify({
        msg_type: "text",
        content: { text },
      }),
    };
  },
  matchesPath(path: string, config: FeishuChannelConfig): boolean {
    return normalizeWebhookPath(path) === config.webhookPath;
  },
};
