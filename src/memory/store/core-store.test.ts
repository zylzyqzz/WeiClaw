import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryCoreStore } from "./core-store.js";

const tempDirs: string[] = [];

async function withStore(run: (store: MemoryCoreStore) => void): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "weiclaw-memory-core-store-"));
  tempDirs.push(root);
  const dbPath = path.join(root, "memory.sqlite");
  const store = new MemoryCoreStore(dbPath);
  try {
    run(store);
  } finally {
    store.close();
  }
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("MemoryCoreStore", () => {
  it("creates and lists namespaces", async () => {
    await withStore((store) => {
      const created = store.createNamespace({ label: "default", scope: "global" });
      const list = store.listNamespaces();
      expect(list).toHaveLength(1);
      expect(list[0]?.namespaceId).toBe(created.namespaceId);
      expect(list[0]?.label).toBe("default");
    });
  });

  it("adds, lists, queries, and deletes records", async () => {
    await withStore((store) => {
      const namespace = store.createNamespace({ label: "default", scope: "global" });
      const created = store.addMemoryRecord({
        namespaceId: namespace.namespaceId,
        kind: "preference",
        content: "user prefers concise Chinese responses",
        source: "test",
      });
      const listed = store.listMemoryRecords({ namespaceId: namespace.namespaceId });
      expect(listed).toHaveLength(1);
      expect(listed[0]?.recordId).toBe(created.recordId);

      const queried = store.queryMemoryRecords({
        namespaceId: namespace.namespaceId,
        text: "concise",
        limit: 10,
      });
      expect(queried).toHaveLength(1);
      expect(queried[0]?.recordId).toBe(created.recordId);

      const deleted = store.deleteMemoryRecord(created.recordId);
      expect(deleted).toBe(true);
      const listedAfterDelete = store.listMemoryRecords({ namespaceId: namespace.namespaceId });
      expect(listedAfterDelete).toHaveLength(0);
    });
  });
});
