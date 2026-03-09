import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { resolveRuntimeMemoryStatus } from "./status.js";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("runtime memory status", () => {
  it("reports runtime toggles and db readiness", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "weiclaw-memory-status-"));
    tempDirs.push(root);
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      WEICLAW_MEMORY_ENABLED: "true",
      WEICLAW_MEMORY_DB_PATH: path.join(root, "memory.sqlite"),
      WEICLAW_MEMORY_DEFAULT_NAMESPACE: "default",
      WEICLAW_MEMORY_RUNTIME_ENABLED: "true",
      WEICLAW_MEMORY_READ_BEFORE_RESPONSE: "true",
      WEICLAW_MEMORY_AUTO_CAPTURE_ENABLED: "false",
      WEICLAW_MEMORY_QUERY_LIMIT: "7",
      WEICLAW_MEMORY_CONTEXT_LIMIT: "900",
    };
    const status = resolveRuntimeMemoryStatus(env);
    expect(status.memoryCoreEnabled).toBe(true);
    expect(status.runtimeEnabled).toBe(true);
    expect(status.readBeforeResponse).toBe(true);
    expect(status.autoCaptureEnabled).toBe(false);
    expect(status.queryLimit).toBe(7);
    expect(status.contextLimit).toBe(900);
    expect(status.dbReady).toBe(true);
    expect(status.namespaceReady).toBe(true);
  });
});

