import { loadChinaChannelConfig, type ChinaChannelConfig } from "../config/china-channel-config.js";
import { feishuAdapter } from "../feishu/adapter.js";
import type {
  ChannelInboundEvent,
  ChannelWebhookRequest,
  ChannelWebhookResponse,
} from "../shared/types.js";
import { CHINA_CHANNEL_FOUNDATION_VERSION } from "../shared/version.js";
import { wecomAdapter } from "../wecom/adapter.js";

export type ChinaChannelRouteResult = {
  matched: boolean;
  channel?: "wecom" | "feishu";
  event?: ChannelInboundEvent;
  response?: ChannelWebhookResponse;
};

export function routeChinaChannelWebhook(
  request: ChannelWebhookRequest,
  config: ChinaChannelConfig = loadChinaChannelConfig(),
): ChinaChannelRouteResult {
  if (config.wecom.enabled && wecomAdapter.matchesPath(request.path, config.wecom)) {
    const event = wecomAdapter.parseInboundEvent(request, config.wecom);
    return {
      matched: true,
      channel: "wecom",
      event,
      response: wecomAdapter.buildTextReply(
        event,
        `WeiClaw ${CHINA_CHANNEL_FOUNDATION_VERSION} WeCom skeleton received your text message.`,
        config.wecom,
      ),
    };
  }

  if (config.feishu.enabled && feishuAdapter.matchesPath(request.path, config.feishu)) {
    const event = feishuAdapter.parseInboundEvent(request, config.feishu);
    return {
      matched: true,
      channel: "feishu",
      event,
      response: feishuAdapter.buildTextReply(
        event,
        `WeiClaw ${CHINA_CHANNEL_FOUNDATION_VERSION} Feishu skeleton received your text message.`,
        config.feishu,
      ),
    };
  }

  return { matched: false };
}
