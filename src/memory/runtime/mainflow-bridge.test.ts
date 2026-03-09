import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createMemoryCoreRuntime } from "../cli/core-runtime.js";
import {
  applyRuntimeMemoryBeforeTurn,
  applyRuntimeMemoryCaptureAfterTurn,
} from "./mainflow-bridge.js";

const tempDirs: string[] = [];

function makeEnv(dbPath: string): NodeJS.ProcessEnv {
  return {
    ...process.env,
    WEICLAW_MEMORY_ENABLED: "true",
    WEICLAW_MEMORY_DB_PATH: dbPath,
    WEICLAW_MEMORY_DEFAULT_NAMESPACE: "default",
    WEICLAW_MEMORY_QUERY_LIMIT: "5",
    WEICLAW_MEMORY_RUNTIME_ENABLED: "true",
    WEICLAW_MEMORY_READ_BEFORE_RESPONSE: "true",
    WEICLAW_MEMORY_AUTO_CAPTURE_ENABLED: "true",
    WEICLAW_MEMORY_CONTEXT_LIMIT: "300",
  };
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("mainflow memory bridge", () => {
  it("integrates read-before-turn and capture-after-turn", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "weiclaw-memory-mainflow-"));
    tempDirs.push(root);
    const env = makeEnv(path.join(root, "memory.sqlite"));

    const runtime = createMemoryCoreRuntime(env);
    runtime.records.addMemoryRecord({
      namespaceRef: "default",
      kind: "preference",
      content: "user prefers concise Chinese responses",
    });
    runtime.close();

    const read = await applyRuntimeMemoryBeforeTurn({
      commandBody: "concise",
      env,
    });
    expect(read.injected).toBe(true);
    expect(read.commandBody).toContain("Long-term memory context");

    const capture = await applyRuntimeMemoryCaptureAfterTurn({
      userText: "Please remember I prefer concise replies",
      payloads: [{ text: "I will remember this preference." }],
      env,
    });
    expect(capture.captured).toBeGreaterThan(0);
  });
});
