export type CoreBridgeProviderKey = "telegram" | "wecom" | "feishu" | "unknown";

export type CoreBridgeInboundEvent = {
  providerKey: CoreBridgeProviderKey;
  externalUserId: string;
  externalChatId: string | null;
  messageId: string;
  messageType: string;
  text: string;
  receivedAt: string;
  metadata: Record<string, unknown>;
};

export type CoreBridgeResolvedContext = {
  resolved: boolean;
  ownerRef: string | null;
  agentRef: string | null;
  memoryNamespaces: string[];
  notes: string[];
};

export type CoreBridgeResult = {
  accepted: boolean;
  handledByCore: boolean;
  context: CoreBridgeResolvedContext | null;
  error: string | null;
};

export type CoreBridgeRuntimeLogger = {
  log: (message: string) => void;
  error: (message: string) => void;
};
