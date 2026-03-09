import type { MemoryNamespace, MemoryNamespaceScope } from "../core-types.js";
import type { MemoryCoreStore } from "../store/core-store.js";

export class MemoryNamespaceService {
  constructor(private readonly store: MemoryCoreStore) {}

  ensureDefaultNamespaces(defaultLabel: string): MemoryNamespace[] {
    const defaults: Array<{ label: string; scope: MemoryNamespaceScope }> = [
      { label: defaultLabel, scope: "global" },
      { label: "agent-default", scope: "agent" },
      { label: "session-default", scope: "session" },
    ];
    for (const entry of defaults) {
      this.store.createNamespace(entry);
    }
    return this.store.listNamespaces();
  }

  createNamespace(params: { label: string; scope?: MemoryNamespaceScope }): MemoryNamespace {
    return this.store.createNamespace({
      label: params.label,
      scope: params.scope ?? "custom",
    });
  }

  listNamespaces(): MemoryNamespace[] {
    return this.store.listNamespaces();
  }

  resolveNamespaceId(namespaceRef: string): string | null {
    const byId = this.store.findNamespaceById(namespaceRef);
    if (byId) {
      return byId.namespaceId;
    }
    const byLabel = this.store.findNamespaceByLabel(namespaceRef);
    return byLabel?.namespaceId ?? null;
  }
}

