import { loadCoreBridgeConfig } from "./bridge-config.js";

export const CORE_BRIDGE_CONTRACT_VERSION = "2.0.6";

export const CORE_BRIDGE_RESOLUTION_FIELDS = [
  "resolutionState",
  "provisioningSummary",
  "namespaceHints",
  "ownerRef",
  "agentRef",
  "memoryNamespaces",
  "notes",
] as const;

export type CoreBridgeStatus = {
  enabled: boolean;
  mode: "noop" | "http";
  endpoint: string;
  timeoutMs: number;
  ready: boolean;
  issues: string[];
  contractVersion: string;
  supportedResolutionFields: readonly string[];
  contextConsumptionEnabled: boolean;
};

export function resolveCoreBridgeStatus(env: NodeJS.ProcessEnv = process.env): CoreBridgeStatus {
  const config = loadCoreBridgeConfig(env);
  const issues: string[] = [];

  if (!config.enabled) {
    issues.push("core-bridge disabled via WEICLAW_CORE_BRIDGE_ENABLED");
  }
  if (config.mode === "http" && !config.endpoint) {
    issues.push("WEICLAW_CORE_BRIDGE_ENDPOINT is required when mode=http");
  }

  const contextConsumptionEnabled =
    config.enabled && config.mode === "http" && Boolean(config.endpoint);

  return {
    enabled: config.enabled,
    mode: config.mode,
    endpoint: config.endpoint,
    timeoutMs: config.timeoutMs,
    ready: issues.length === 0,
    issues,
    contractVersion: CORE_BRIDGE_CONTRACT_VERSION,
    supportedResolutionFields: CORE_BRIDGE_RESOLUTION_FIELDS,
    contextConsumptionEnabled,
  };
}
