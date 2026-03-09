export type ChinaChannelId = "wecom" | "feishu";

export type ChannelMessage = {
  channel: ChinaChannelId;
  senderId: string;
  conversationId: string;
  text: string;
  timestamp: string;
  raw: unknown;
};

export type ChannelInboundEvent = {
  channel: ChinaChannelId;
  eventType: "message.text" | "url_verification" | "unknown";
  message?: ChannelMessage;
  verificationChallenge?: string;
  raw: unknown;
};

export type ChannelOutboundMessage = {
  channel: ChinaChannelId;
  targetId: string;
  text: string;
};

export type ChannelHealthStatus = {
  channel: ChinaChannelId;
  enabled: boolean;
  configured: boolean;
  webhookPath: string;
  status: "disabled" | "ready" | "degraded";
  missingFields: string[];
  notes: string[];
};

export type ChannelWebhookRequest = {
  method: string;
  path: string;
  headers: Record<string, string | undefined>;
  body: string;
};

export type ChannelWebhookResponse = {
  statusCode: number;
  contentType: string;
  body: string;
};

export type ChannelAdapter<TConfig> = {
  readonly channel: ChinaChannelId;
  getHealthStatus(config: TConfig): ChannelHealthStatus;
  parseInboundEvent(request: ChannelWebhookRequest, config: TConfig): ChannelInboundEvent;
  buildTextReply(event: ChannelInboundEvent, text: string, config: TConfig): ChannelWebhookResponse;
  matchesPath(path: string, config: TConfig): boolean;
};
