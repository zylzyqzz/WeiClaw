import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createMemoryCoreRuntime } from "../cli/core-runtime.js";
import { RuntimeMemoryService } from "./runtime-memory-service.js";

const tempDirs: string[] = [];

function buildEnv(params: {
  dbPath: string;
  runtimeEnabled: boolean;
  autoCaptureEnabled: boolean;
}): NodeJS.ProcessEnv {
  return {
    ...process.env,
    WEICLAW_MEMORY_ENABLED: "true",
    WEICLAW_MEMORY_DB_PATH: params.dbPath,
    WEICLAW_MEMORY_DEFAULT_NAMESPACE: "default",
    WEICLAW_MEMORY_QUERY_LIMIT: "5",
    WEICLAW_MEMORY_RUNTIME_ENABLED: params.runtimeEnabled ? "true" : "false",
    WEICLAW_MEMORY_READ_BEFORE_RESPONSE: "true",
    WEICLAW_MEMORY_AUTO_CAPTURE_ENABLED: params.autoCaptureEnabled ? "true" : "false",
    WEICLAW_MEMORY_CONTEXT_LIMIT: "400",
  };
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("RuntimeMemoryService", () => {
  it("does not inject when runtime integration is disabled", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "weiclaw-memory-runtime-off-"));
    tempDirs.push(root);
    const env = buildEnv({
      dbPath: path.join(root, "memory.sqlite"),
      runtimeEnabled: false,
      autoCaptureEnabled: false,
    });
    const service = new RuntimeMemoryService(env);
    const result = await service.preparePrompt({
      prompt: "hello",
      queryText: "hello",
    });
    expect(result.injected).toBe(false);
    expect(result.prompt).toBe("hello");
  });

  it("injects matching memory when runtime integration is enabled", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "weiclaw-memory-runtime-on-"));
    tempDirs.push(root);
    const dbPath = path.join(root, "memory.sqlite");
    const env = buildEnv({
      dbPath,
      runtimeEnabled: true,
      autoCaptureEnabled: false,
    });
    const runtime = createMemoryCoreRuntime(env);
    runtime.records.addMemoryRecord({
      namespaceRef: "default",
      kind: "preference",
      content: "user prefers concise Chinese responses",
    });
    runtime.close();

    const service = new RuntimeMemoryService(env);
    const result = await service.preparePrompt({
      prompt: "Please answer in Chinese.",
      queryText: "concise",
    });
    expect(result.injected).toBe(true);
    expect(result.prompt).toContain("Long-term memory context");
    expect(result.results.length).toBeGreaterThan(0);
  });

  it("respects auto-capture toggle", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "weiclaw-memory-runtime-capture-"));
    tempDirs.push(root);
    const dbPath = path.join(root, "memory.sqlite");
    const envOff = buildEnv({
      dbPath,
      runtimeEnabled: true,
      autoCaptureEnabled: false,
    });
    const serviceOff = new RuntimeMemoryService(envOff);
    const offResult = await serviceOff.captureFromTurn({
      userText: "Please remember I prefer concise replies",
      assistantText: "Understood",
    });
    expect(offResult.captured).toBe(0);

    const envOn = buildEnv({
      dbPath,
      runtimeEnabled: true,
      autoCaptureEnabled: true,
    });
    const serviceOn = new RuntimeMemoryService(envOn);
    const onResult = await serviceOn.captureFromTurn({
      userText: "Please remember I prefer concise replies",
      assistantText: "I will remember this preference",
    });
    expect(onResult.captured).toBeGreaterThan(0);
  });
});

