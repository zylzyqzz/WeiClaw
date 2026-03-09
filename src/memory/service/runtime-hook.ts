import type { MemoryCoreRuntime } from "../cli/core-runtime.js";
import type { MemorySearchResult } from "../core-types.js";

export async function loadMemoryContextForRuntime(params: {
  runtime: MemoryCoreRuntime;
  namespace: string;
  query: string;
  limit?: number;
}): Promise<MemorySearchResult[]> {
  const limit = params.limit ?? params.runtime.config.queryLimit;
  return params.runtime.query.queryMemory({
    namespaceRef: params.namespace,
    text: params.query,
    limit,
  });
}
