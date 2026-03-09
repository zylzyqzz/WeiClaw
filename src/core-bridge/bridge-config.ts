export type CoreBridgeMode = "noop" | "http";

export type CoreBridgeConfig = {
  enabled: boolean;
  mode: CoreBridgeMode;
  endpoint: string;
  timeoutMs: number;
};

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on") {
    return true;
  }
  if (normalized === "0" || normalized === "false" || normalized === "no" || normalized === "off") {
    return false;
  }
  return fallback;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function parseMode(value: string | undefined): CoreBridgeMode {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "http") {
    return "http";
  }
  return "noop";
}

export function loadCoreBridgeConfig(env: NodeJS.ProcessEnv = process.env): CoreBridgeConfig {
  return {
    enabled: parseBool(env.WEICLAW_CORE_BRIDGE_ENABLED, false),
    mode: parseMode(env.WEICLAW_CORE_BRIDGE_MODE),
    endpoint: (env.WEICLAW_CORE_BRIDGE_ENDPOINT ?? "").trim(),
    timeoutMs: parsePositiveInt(env.WEICLAW_CORE_BRIDGE_TIMEOUT_MS, 1500),
  };
}
