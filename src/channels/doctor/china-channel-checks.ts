import { resolveCoreBridgeStatus, type CoreBridgeStatus } from "../../core-bridge/status.js";
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
  bridge: CoreBridgeStatus;
};

export function collectChinaChannelStatuses(
  config: ChinaChannelConfig = loadChinaChannelConfig(),
): ChannelHealthStatus[] {
  return [wecomAdapter.getHealthStatus(config.wecom), feishuAdapter.getHealthStatus(config.feishu)];
}

export function formatChinaChannelStatusLines(
  config: ChinaChannelConfig = loadChinaChannelConfig(),
): string[] {
  const lines = collectChinaChannelStatuses(config).map(
    (status) =>
      `${status.channel}: ${status.status} enabled=${status.enabled} webhookPath=${status.webhookPath}`,
  );
  const bridgeStatus = resolveCoreBridgeStatus();
  lines.push(
    `core-bridge: enabled=${bridgeStatus.enabled} mode=${bridgeStatus.mode} endpoint=${bridgeStatus.endpoint || "none"} timeoutMs=${bridgeStatus.timeoutMs} contractVersion=${bridgeStatus.contractVersion} contextConsumptionEnabled=${bridgeStatus.contextConsumptionEnabled}`,
  );
  return lines;
}

export function runChinaChannelDoctor(
  runtime: Pick<RuntimeEnv, "log">,
  config: ChinaChannelConfig = loadChinaChannelConfig(),
): ChinaChannelDiagnostics {
  const statuses = collectChinaChannelStatuses(config);
  const bridge = resolveCoreBridgeStatus();
  runtime.log(`WeiClaw ${CHINA_CHANNEL_FOUNDATION_VERSION} China channel doctor`);
  for (const status of statuses) {
    runtime.log(
      `${status.channel}: status=${status.status} enabled=${status.enabled} missing=${status.missingFields.join(",") || "none"}`,
    );
  }
  runtime.log(
    `core-bridge: enabled=${bridge.enabled} mode=${bridge.mode} endpoint=${bridge.endpoint || "none"} timeoutMs=${bridge.timeoutMs} contractVersion=${bridge.contractVersion} contextConsumptionEnabled=${bridge.contextConsumptionEnabled} ready=${bridge.ready}`,
  );
  return { version: CHINA_CHANNEL_FOUNDATION_VERSION, statuses, bridge };
}

export async function runChinaChannelRouteTest(
  runtime: Pick<RuntimeEnv, "log">,
  config: ChinaChannelConfig = loadChinaChannelConfig(),
): Promise<{
  version: string;
  routes: Array<{ channel: string; matched: boolean; statusCode?: number }>;
}> {
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

  const routes = await Promise.all(
    requests.map(async (request) => {
      const result = await routeChinaChannelWebhook(request, config);
      runtime.log(
        `${request.path}: matched=${result.matched} statusCode=${result.response?.statusCode ?? "none"}`,
      );
      return {
        channel: result.channel ?? request.path,
        matched: result.matched,
        statusCode: result.response?.statusCode,
      };
    }),
  );

  return {
    version: CHINA_CHANNEL_FOUNDATION_VERSION,
    routes,
  };
}
