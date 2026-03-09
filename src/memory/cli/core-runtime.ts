import { loadMemoryCoreConfig, type MemoryCoreConfig } from "../config/core-config.js";
import { MemoryCoreStore } from "../store/core-store.js";
import { MemoryNamespaceService } from "../service/namespace-service.js";
import { MemoryRecordService } from "../service/record-service.js";
import { MemoryQueryService } from "../service/query-service.js";

export type MemoryCoreRuntime = {
  config: MemoryCoreConfig;
  store: MemoryCoreStore;
  namespaces: MemoryNamespaceService;
  records: MemoryRecordService;
  query: MemoryQueryService;
  close: () => void;
};

export function createMemoryCoreRuntime(env: NodeJS.ProcessEnv = process.env): MemoryCoreRuntime {
  const config = loadMemoryCoreConfig(env);
  const store = new MemoryCoreStore(config.dbPath);
  const namespaces = new MemoryNamespaceService(store);
  namespaces.ensureDefaultNamespaces(config.defaultNamespace);
  const records = new MemoryRecordService(store, namespaces);
  const query = new MemoryQueryService(store, namespaces);
  return {
    config,
    store,
    namespaces,
    records,
    query,
    close: () => store.close(),
  };
}

