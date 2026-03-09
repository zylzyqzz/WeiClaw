export type MemoryNamespaceScope = "global" | "agent" | "session" | "custom";

export type MemoryNamespace = {
  namespaceId: string;
  scope: MemoryNamespaceScope;
  label: string;
  createdAt: string;
};

export type MemoryRecord = {
  recordId: string;
  namespaceId: string;
  kind: string;
  content: string;
  source: string;
  createdAt: string;
  updatedAt: string;
};

export type MemoryQuery = {
  namespaceId?: string;
  text: string;
  limit?: number;
};

export type MemorySearchResult = {
  recordId: string;
  namespaceId: string;
  content: string;
  matchReason: string;
};
