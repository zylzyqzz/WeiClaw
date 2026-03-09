import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryCoreStore } from "../store/core-store.js";
import { MemoryNamespaceService } from "./namespace-service.js";
import { MemoryRecordService } from "./record-service.js";
import { MemoryQueryService } from "./query-service.js";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("MemoryQueryService", () => {
  it("queries records via namespace label", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "weiclaw-memory-core-service-"));
    tempDirs.push(root);
    const store = new MemoryCoreStore(path.join(root, "memory.sqlite"));
    try {
      const namespaces = new MemoryNamespaceService(store);
      const records = new MemoryRecordService(store, namespaces);
      const query = new MemoryQueryService(store, namespaces);

      namespaces.createNamespace({ label: "default", scope: "global" });
      records.addMemoryRecord({
        namespaceRef: "default",
        kind: "fact",
        content: "project uses concise responses",
      });

      const results = query.queryMemory({
        namespaceRef: "default",
        text: "concise",
        limit: 5,
      });

      expect(results).toHaveLength(1);
      expect(results[0]?.matchReason).toBe("substring_match");
    } finally {
      store.close();
    }
  });
});

