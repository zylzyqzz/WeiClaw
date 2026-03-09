import { normalizeChannelTextMessage } from "../shared/message-normalizer.js";
import type { ChannelInboundEvent, ChannelWebhookRequest } from "../shared/types.js";

export function parseFeishuInboundEvent(request: ChannelWebhookRequest): ChannelInboundEvent {
  const payload = JSON.parse(request.body || "{}") as Record<string, any>;
  if (payload.type === "url_verification") {
    return {
      channel: "feishu",
      eventType: "url_verification",
      verificationChallenge: String(payload.challenge ?? ""),
      raw: payload,
    };
  }

  const text = JSON.parse(String(payload.event?.message?.content ?? '{"text":""}')).text ?? "";
  if (payload.header?.event_type === "im.message.receive_v1") {
    return {
      channel: "feishu",
      eventType: "message.text",
      message: normalizeChannelTextMessage({
        channel: "feishu",
        senderId: String(payload.event?.sender?.sender_id?.open_id ?? ""),
        conversationId: String(payload.event?.message?.chat_id ?? "feishu-default"),
        text: String(text),
        timestamp: payload.header?.create_time
          ? new Date(Number(payload.header.create_time)).toISOString()
          : undefined,
        raw: payload,
      }),
      raw: payload,
    };
  }

  return {
    channel: "feishu",
    eventType: "unknown",
    raw: payload,
  };
}
