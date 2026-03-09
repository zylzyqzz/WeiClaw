import { normalizeChannelTextMessage } from "../shared/message-normalizer.js";
import type { ChannelInboundEvent, ChannelWebhookRequest } from "../shared/types.js";

function readXmlField(xml: string, tag: string): string {
  const match = xml.match(
    new RegExp(`<${tag}><!\\[CDATA\\[(.*?)\\]\\]><\\/${tag}>|<${tag}>(.*?)<\\/${tag}>`, "s"),
  );
  return (match?.[1] ?? match?.[2] ?? "").trim();
}

export function parseWeComInboundEvent(request: ChannelWebhookRequest): ChannelInboundEvent {
  const messageType = readXmlField(request.body, "MsgType");
  if (messageType.toLowerCase() === "text") {
    return {
      channel: "wecom",
      eventType: "message.text",
      message: normalizeChannelTextMessage({
        channel: "wecom",
        senderId: readXmlField(request.body, "FromUserName"),
        conversationId: readXmlField(request.body, "ToUserName") || "wecom-default",
        text: readXmlField(request.body, "Content"),
        timestamp: new Date(
          Number(readXmlField(request.body, "CreateTime") || 0) * 1000 || Date.now(),
        ).toISOString(),
        raw: request.body,
      }),
      raw: request.body,
    };
  }

  return {
    channel: "wecom",
    eventType: "unknown",
    raw: request.body,
  };
}
