import type { ChannelMessage, ChinaChannelId } from "./types.js";

export function normalizeChannelTextMessage(params: {
  channel: ChinaChannelId;
  senderId: string;
  conversationId: string;
  text: string;
  timestamp?: string;
  raw: unknown;
}): ChannelMessage {
  return {
    channel: params.channel,
    senderId: params.senderId.trim(),
    conversationId: params.conversationId.trim(),
    text: params.text.trim(),
    timestamp: params.timestamp ?? new Date().toISOString(),
    raw: params.raw,
  };
}
