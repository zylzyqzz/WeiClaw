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

/**
 * Agent Profile from WeiClaw-Core (private)
 * Reserved interface for future agent customization
 */
export type CoreBridgeAgentProfile = {
  /** Agent role/personality definition */
  role?: string;
  /** System prompt override */
  systemPrompt?: string;
  /** Available tools for this agent */
  tools?: string[];
  /** Model preferences */
  modelPreferences?: {
    provider?: string;
    model?: string;
  };
};

/**
 * Dynamic skill distribution from WeiClaw-Core (private)
 * Reserved interface for runtime skill injection
 */
export type CoreBridgeDynamicSkills = {
  /** Skill names enabled for this session */
  enabledSkills?: string[];
  /** Skill-specific parameters */
  skillParams?: Record<string, Record<string, unknown>>;
  /** Priority order for skill execution */
  skillOrder?: string[];
};

export type CoreBridgeResolvedContext = {
  resolutionState: CoreBridgeResolutionState;
  provisioningSummary: CoreBridgeProvisioningSummary | null;
  namespaceHints: string[];
  ownerRef: string | null;
  agentRef: string | null;
  memoryNamespaces: string[];
  notes: string[];
  // Reserved for WeiClaw-Core private extension
  agentProfile?: CoreBridgeAgentProfile;
  dynamicSkills?: CoreBridgeDynamicSkills;
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
