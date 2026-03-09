import { createMemoryCoreRuntime } from "../cli/core-runtime.js";
import { loadMemoryCoreConfig } from "../config/core-config.js";

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

export type RuntimeMemoryStatus = {
  memoryCoreEnabled: boolean;
  runtimeEnabled: boolean;
  readBeforeResponse: boolean;
  autoCaptureEnabled: boolean;
  defaultNamespace: string;
  queryLimit: number;
  contextLimit: number;
  dbPath: string;
  dbReady: boolean;
  namespaceReady: boolean;
  issues: string[];
};

export function resolveRuntimeMemoryStatus(
  env: NodeJS.ProcessEnv = process.env,
): RuntimeMemoryStatus {
  const coreConfig = loadMemoryCoreConfig(env);
  const runtimeEnabled = parseBool(env.WEICLAW_MEMORY_RUNTIME_ENABLED, false);
  const readBeforeResponse = parseBool(env.WEICLAW_MEMORY_READ_BEFORE_RESPONSE, true);
  const autoCaptureEnabled = parseBool(env.WEICLAW_MEMORY_AUTO_CAPTURE_ENABLED, false);
  const contextLimit = parsePositiveInt(env.WEICLAW_MEMORY_CONTEXT_LIMIT, 1200);
  const issues: string[] = [];
  let dbReady = false;
  let namespaceReady = false;

  if (!coreConfig.enabled) {
    issues.push("memory-core disabled via WEICLAW_MEMORY_ENABLED");
  }
  if (!runtimeEnabled) {
    issues.push("runtime integration disabled via WEICLAW_MEMORY_RUNTIME_ENABLED");
  }

  try {
    const runtime = createMemoryCoreRuntime(env);
    try {
      dbReady = true;
      const namespaceId = runtime.namespaces.resolveNamespaceId(coreConfig.defaultNamespace);
      namespaceReady = Boolean(namespaceId);
      if (!namespaceReady) {
        issues.push(`default namespace missing: ${coreConfig.defaultNamespace}`);
      }
    } finally {
      runtime.close();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    issues.push(`memory db unavailable: ${message}`);
  }

  return {
    memoryCoreEnabled: coreConfig.enabled,
    runtimeEnabled,
    readBeforeResponse,
    autoCaptureEnabled,
    defaultNamespace: coreConfig.defaultNamespace,
    queryLimit: coreConfig.queryLimit,
    contextLimit,
    dbPath: coreConfig.dbPath,
    dbReady,
    namespaceReady,
    issues,
  };
}
