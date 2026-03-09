import type { MemorySearchResult } from "../core-types.js";
import type { MemoryCoreStore } from "../store/core-store.js";
import type { MemoryNamespaceService } from "./namespace-service.js";
import { normalizeQueryText } from "../query/text-query.js";

export class MemoryQueryService {
  constructor(
    private readonly store: MemoryCoreStore,
    private readonly namespaces: MemoryNamespaceService,
  ) {}

  queryMemory(params: {
    namespaceRef?: string;
    text: string;
    limit: number;
  }): MemorySearchResult[] {
    const text = normalizeQueryText(params.text);
    if (!text) {
      return [];
    }
    const resolvedNamespaceId = params.namespaceRef
      ? this.namespaces.resolveNamespaceId(params.namespaceRef)
      : null;
    if (params.namespaceRef && !resolvedNamespaceId) {
      throw new Error(`Unknown namespace: ${params.namespaceRef}`);
    }
    const namespaceId = resolvedNamespaceId ?? undefined;
    return this.store.queryMemoryRecords({
      namespaceId,
      text,
      limit: params.limit,
    });
  }
}
