import type { RuntimeEnv } from "../../runtime.js";
import { loadChinaChannelConfig, type ChinaChannelConfig } from "../config/china-channel-config.js";
import { feishuAdapter } from "../feishu/adapter.js";
import { routeChinaChannelWebhook } from "../router/china-channel-router.js";
import type { ChannelHealthStatus, ChannelWebhookRequest } from "../shared/types.js";
import { CHINA_CHANNEL_FOUNDATION_VERSION } from "../shared/version.js";
import { wecomAdapter } from "../wecom/adapter.js";

export type ChinaChannelDiagnostics = {
  version: string;
  statuses: ChannelHealthStatus[];
};

export function collectChinaChannelStatuses(
  config: ChinaChannelConfig = loadChinaChannelConfig(),
): ChannelHealthStatus[] {
  return [wecomAdapter.getHealthStatus(config.wecom), feishuAdapter.getHealthStatus(config.feishu)];
}

export function formatChinaChannelStatusLines(
  config: ChinaChannelConfig = loadChinaChannelConfig(),
): string[] {
  return collectChinaChannelStatuses(config).map(
    (status) =>
      `${status.channel}: ${status.status} enabled=${status.enabled} webhookPath=${status.webhookPath}`,
  );
}

export function runChinaChannelDoctor(
  runtime: Pick<RuntimeEnv, "log">,
  config: ChinaChannelConfig = loadChinaChannelConfig(),
): ChinaChannelDiagnostics {
  const statuses = collectChinaChannelStatuses(config);
  runtime.log(`WeiClaw ${CHINA_CHANNEL_FOUNDATION_VERSION} China channel doctor`);
  for (const status of statuses) {
    runtime.log(
      `${status.channel}: status=${status.status} enabled=${status.enabled} missing=${status.missingFields.join(",") || "none"}`,
    );
  }
  return { version: CHINA_CHANNEL_FOUNDATION_VERSION, statuses };
}

export function runChinaChannelRouteTest(
  runtime: Pick<RuntimeEnv, "log">,
  config: ChinaChannelConfig = loadChinaChannelConfig(),
): {
  version: string;
  routes: Array<{ channel: string; matched: boolean; statusCode?: number }>;
} {
  const requests: ChannelWebhookRequest[] = [
    {
      method: "POST",
      path: config.wecom.webhookPath,
      headers: {},
      body: "<xml><ToUserName><![CDATA[bot]]></ToUserName><FromUserName><![CDATA[user-1]]></FromUserName><CreateTime>1710000000</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[hello]]></Content></xml>",
    },
    {
      method: "POST",
      path: config.feishu.webhookPath,
      headers: {},
      body: JSON.stringify({
        header: { event_type: "im.message.receive_v1", create_time: "1710000000000" },
        event: {
          sender: { sender_id: { open_id: "ou_1" } },
          message: { chat_id: "oc_1", content: JSON.stringify({ text: "hello" }) },
        },
      }),
    },
  ];

  const routes = requests.map((request) => {
    const result = routeChinaChannelWebhook(request, config);
    runtime.log(
      `${request.path}: matched=${result.matched} statusCode=${result.response?.statusCode ?? "none"}`,
    );
    return {
      channel: result.channel ?? request.path,
      matched: result.matched,
      statusCode: result.response?.statusCode,
    };
  });

  return {
    version: CHINA_CHANNEL_FOUNDATION_VERSION,
    routes,
  };
}
