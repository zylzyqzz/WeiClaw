import { normalizeWebhookPath } from "../../plugin-sdk/webhook-path.js";
import type {
  ChannelAdapter,
  ChannelHealthStatus,
  ChannelInboundEvent,
  ChannelWebhookRequest,
  ChannelWebhookResponse,
} from "../shared/types.js";
import type { WeComChannelConfig } from "./config.js";
import { parseWeComInboundEvent } from "./parser.js";

const REQUIRED_FIELDS: Array<keyof WeComChannelConfig> = [
  "corpId",
  "corpSecret",
  "agentId",
  "token",
  "encodingAESKey",
];

export const wecomAdapter: ChannelAdapter<WeComChannelConfig> = {
  channel: "wecom",
  getHealthStatus(config): ChannelHealthStatus {
    const missingFields = REQUIRED_FIELDS.filter((field) => !String(config[field] ?? "").trim());
    const configured = missingFields.length === 0;
    return {
      channel: "wecom",
      enabled: config.enabled,
      configured,
      webhookPath: config.webhookPath,
      status: !config.enabled ? "disabled" : configured ? "ready" : "degraded",
      missingFields: config.enabled ? missingFields.map(String) : [],
      notes: [
        "v2.0.1 WeCom adapter skeleton only covers config, webhook route, text parse, and text reply formatting.",
      ],
    };
  },
  parseInboundEvent(
    request: ChannelWebhookRequest,
    config: WeComChannelConfig,
  ): ChannelInboundEvent {
    if (!config.enabled) {
      throw new Error("WeCom adapter is disabled.");
    }
    return parseWeComInboundEvent(request);
  },
  buildTextReply(event, text): ChannelWebhookResponse {
    const target = event.message?.senderId ?? "";
    const source = event.message?.conversationId ?? "";
    return {
      statusCode: 200,
      contentType: "application/xml",
      body: `<xml><ToUserName><![CDATA[${target}]]></ToUserName><FromUserName><![CDATA[${source}]]></FromUserName><CreateTime>${Math.floor(Date.now() / 1000)}</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[${text}]]></Content></xml>`,
    };
  },
  matchesPath(path: string, config: WeComChannelConfig): boolean {
    return normalizeWebhookPath(path) === config.webhookPath;
  },
};
