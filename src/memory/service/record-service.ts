import type { MemoryRecord } from "../core-types.js";
import type { MemoryCoreStore } from "../store/core-store.js";
import type { MemoryNamespaceService } from "./namespace-service.js";

export class MemoryRecordService {
  constructor(
    private readonly store: MemoryCoreStore,
    private readonly namespaces: MemoryNamespaceService,
  ) {}

  addMemoryRecord(params: {
    namespaceRef: string;
    kind: string;
    content: string;
    source?: string;
  }): MemoryRecord {
    const namespaceId = this.namespaces.resolveNamespaceId(params.namespaceRef);
    if (!namespaceId) {
      throw new Error(`Unknown namespace: ${params.namespaceRef}`);
    }
    return this.store.addMemoryRecord({
      namespaceId,
      kind: params.kind,
      content: params.content,
      source: params.source ?? "cli",
    });
  }

  listMemoryRecords(params: { namespaceRef: string; limit?: number }): MemoryRecord[] {
    const namespaceId = this.namespaces.resolveNamespaceId(params.namespaceRef);
    if (!namespaceId) {
      throw new Error(`Unknown namespace: ${params.namespaceRef}`);
    }
    return this.store.listMemoryRecords({
      namespaceId,
      limit: params.limit,
    });
  }

  deleteMemoryRecord(recordId: string): boolean {
    return this.store.deleteMemoryRecord(recordId);
  }
}
