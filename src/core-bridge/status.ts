import { loadCoreBridgeConfig } from "./bridge-config.js";

export type CoreBridgeStatus = {
  enabled: boolean;
  mode: "noop" | "http";
  endpoint: string;
  timeoutMs: number;
  ready: boolean;
  issues: string[];
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

  return {
    enabled: config.enabled,
    mode: config.mode,
    endpoint: config.endpoint,
    timeoutMs: config.timeoutMs,
    ready: issues.length === 0,
    issues,
  };
}
