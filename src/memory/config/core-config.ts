import os from "node:os";
import path from "node:path";
import { resolveStateDir } from "../../config/paths.js";

export type MemoryCoreConfig = {
  enabled: boolean;
  dataDir: string;
  dbPath: string;
  defaultNamespace: string;
  queryLimit: number;
};

function parseBool(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) {
    return defaultValue;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on") {
    return true;
  }
  if (
    normalized === "0" ||
    normalized === "false" ||
    normalized === "no" ||
    normalized === "off"
  ) {
    return false;
  }
  return defaultValue;
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

export function loadMemoryCoreConfig(env: NodeJS.ProcessEnv = process.env): MemoryCoreConfig {
  const stateDir = resolveStateDir(env, os.homedir);
  const dataDir =
    env.WEICLAW_MEMORY_DATA_DIR?.trim() || path.join(stateDir, "memory-core");
  const dbPath =
    env.WEICLAW_MEMORY_DB_PATH?.trim() || path.join(dataDir, "memory-core.sqlite");
  const defaultNamespace = env.WEICLAW_MEMORY_DEFAULT_NAMESPACE?.trim() || "default";
  const queryLimit = parsePositiveInt(env.WEICLAW_MEMORY_QUERY_LIMIT, 20);
  const enabled = parseBool(env.WEICLAW_MEMORY_ENABLED, true);
  return {
    enabled,
    dataDir,
    dbPath,
    defaultNamespace,
    queryLimit,
  };
}

