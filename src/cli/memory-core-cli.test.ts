import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Command } from "commander";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerMemoryCli } from "./memory-cli.js";
import { defaultRuntime } from "../runtime.js";

const tempDirs: string[] = [];
const envBackup = { ...process.env };

async function runMemoryCli(args: string[]) {
  const program = new Command();
  program.name("test");
  registerMemoryCli(program);
  await program.parseAsync(["memory", ...args], { from: "user" });
}

function readLastJson(log: ReturnType<typeof vi.spyOn>): unknown {
  const payload = log.mock.calls.at(-1)?.[0];
  return JSON.parse(String(payload ?? "null"));
}

beforeEach(async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "weiclaw-memory-core-cli-"));
  tempDirs.push(root);
  process.env.WEICLAW_MEMORY_ENABLED = "true";
  process.env.WEICLAW_MEMORY_DATA_DIR = root;
  process.env.WEICLAW_MEMORY_DB_PATH = path.join(root, "memory.sqlite");
  process.env.WEICLAW_MEMORY_DEFAULT_NAMESPACE = "default";
  process.env.WEICLAW_MEMORY_QUERY_LIMIT = "20";
});

afterEach(async () => {
  const currentKeys = Object.keys(process.env);
  for (const key of currentKeys) {
    if (!(key in envBackup)) {
      delete process.env[key];
    }
  }
  for (const [key, value] of Object.entries(envBackup)) {
    process.env[key] = value;
  }
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

describe("memory core cli", () => {
  it("creates namespace and adds/queries/deletes records", async () => {
    const log = vi.spyOn(defaultRuntime, "log").mockImplementation(() => {});

    await runMemoryCli(["namespace", "create", "--label", "default", "--scope", "global", "--json"]);
    const createdNamespace = readLastJson(log) as { namespaceId: string };
    expect(createdNamespace.namespaceId).toBeTruthy();

    await runMemoryCli([
      "add",
      "--namespace",
      "default",
      "--kind",
      "preference",
      "--content",
      "user prefers concise Chinese responses",
      "--json",
    ]);
    const createdRecord = readLastJson(log) as { recordId: string };
    expect(createdRecord.recordId).toBeTruthy();

    await runMemoryCli(["query", "--namespace", "default", "--text", "concise", "--json"]);
    const queryResults = readLastJson(log) as Array<{ recordId: string }>;
    expect(queryResults).toHaveLength(1);
    expect(queryResults[0]?.recordId).toBe(createdRecord.recordId);

    await runMemoryCli(["delete", "--record-id", createdRecord.recordId, "--json"]);
    const deleteResult = readLastJson(log) as { deleted: boolean };
    expect(deleteResult.deleted).toBe(true);
  });

  it("supports memory doctor", async () => {
    const log = vi.spyOn(defaultRuntime, "log").mockImplementation(() => {});

    await runMemoryCli(["doctor", "--json"]);
    const report = readLastJson(log) as {
      status: string;
      defaultNamespace: string;
      runtime: { runtimeEnabled: boolean };
    };
    expect(report.status).toBe("ok");
    expect(report.defaultNamespace).toBe("default");
    expect(typeof report.runtime.runtimeEnabled).toBe("boolean");
  });
});
