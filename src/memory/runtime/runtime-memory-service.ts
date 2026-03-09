import { createMemoryCoreRuntime, type MemoryCoreSearchResult } from "../index.js";
import type { BridgeMemoryHints } from "./bridge-memory-hints.js";
import { selectCaptureCandidates } from "./capture-policy.js";
import { buildMemoryContextSnippet, injectMemoryContextIntoPrompt } from "./context-injector.js";
import { resolveRuntimeMemoryStatus, type RuntimeMemoryStatus } from "./status.js";

export type RuntimeMemoryReadResult = {
  prompt: string;
  injected: boolean;
  results: MemoryCoreSearchResult[];
  contextSnippet: string | null;
  namespaceHints: string[];
};

export type RuntimeMemoryCaptureResult = {
  captured: number;
  skipped: boolean;
};

export class RuntimeMemoryService {
  private readonly status: RuntimeMemoryStatus;

  constructor(private readonly env: NodeJS.ProcessEnv = process.env) {
    this.status = resolveRuntimeMemoryStatus(env);
  }

  getStatus(): RuntimeMemoryStatus {
    return this.status;
  }

  async preparePrompt(params: {
    prompt: string;
    queryText: string;
    namespace?: string;
    bridgeHints?: BridgeMemoryHints;
  }): Promise<RuntimeMemoryReadResult> {
    if (
      !this.status.memoryCoreEnabled ||
      !this.status.runtimeEnabled ||
      !this.status.readBeforeResponse
    ) {
      return {
        prompt: params.prompt,
        injected: false,
        results: [],
        contextSnippet: null,
        namespaceHints: [],
      };
    }

    let runtime: ReturnType<typeof createMemoryCoreRuntime> | null = null;
    try {
      runtime = createMemoryCoreRuntime(this.env);

      let namespaceRef = params.namespace ?? this.status.defaultNamespace;
      const namespaceHints: string[] = [];

      if (params.bridgeHints && params.bridgeHints.namespaces.length > 0) {
        const hints = params.bridgeHints.namespaces;
        namespaceHints.push(...hints);
        if (!params.namespace) {
          namespaceRef = hints[0];
        }
      }

      const results = runtime.query.queryMemory({
        namespaceRef,
        text: params.queryText,
        limit: this.status.queryLimit,
      });
      const contextSnippet = buildMemoryContextSnippet({
        results,
        contextLimit: this.status.contextLimit,
      });
      const prompt = injectMemoryContextIntoPrompt({
        prompt: params.prompt,
        contextSnippet,
      });
      return {
        prompt,
        injected: contextSnippet !== null,
        results,
        contextSnippet,
        namespaceHints,
      };
    } finally {
      runtime?.close();
    }
  }

  async captureFromTurn(params: {
    userText: string;
    assistantText?: string;
    namespace?: string;
  }): Promise<RuntimeMemoryCaptureResult> {
    if (
      !this.status.memoryCoreEnabled ||
      !this.status.runtimeEnabled ||
      !this.status.autoCaptureEnabled
    ) {
      return { captured: 0, skipped: true };
    }

    const candidates = selectCaptureCandidates({
      userText: params.userText,
      assistantText: params.assistantText,
      maxCandidates: 3,
    });
    if (candidates.length === 0) {
      return { captured: 0, skipped: true };
    }

    let runtime: ReturnType<typeof createMemoryCoreRuntime> | null = null;
    try {
      runtime = createMemoryCoreRuntime(this.env);
      const namespaceRef = params.namespace ?? this.status.defaultNamespace;
      let captured = 0;
      for (const candidate of candidates) {
        runtime.records.addMemoryRecord({
          namespaceRef,
          kind: candidate.kind,
          content: candidate.content,
          source: "runtime:auto-capture",
        });
        captured += 1;
      }
      return { captured, skipped: false };
    } finally {
      runtime?.close();
    }
  }
}

export function createRuntimeMemoryService(
  env: NodeJS.ProcessEnv = process.env,
): RuntimeMemoryService {
  return new RuntimeMemoryService(env);
}
