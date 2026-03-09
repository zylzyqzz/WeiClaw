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

export type CoreBridgeResolutionState =
  | "resolved"
  | "unresolved"
  | "unclaimed_device"
  | "claim_required"
  | "error";

export type CoreBridgeProvisioningSummary = {
  deviceBound: boolean;
  claimRequired: boolean;
  ownerKnown: boolean;
  agentReady: boolean;
  memoryReady: boolean;
};

export type CoreBridgeResolvedContext = {
  resolutionState: CoreBridgeResolutionState;
  provisioningSummary: CoreBridgeProvisioningSummary | null;
  namespaceHints: string[];
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
