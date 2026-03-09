import type { ReplyPayload } from "../../auto-reply/types.js";
import { extractBridgeMemoryHints, mergeNamespaceHints } from "./bridge-memory-hints.js";
import { createRuntimeMemoryService } from "./runtime-memory-service.js";

export type RuntimeMemoryPromptIntegration = {
  commandBody: string;
  injected: boolean;
  injectedRecords: number;
  namespaceHints: string[];
  bridgeHintsSource: "bridge" | "default";
};

export type BridgeContextInfo = {
  consumed: boolean;
  resolutionState: string | null;
  notes: string[];
};

export async function applyRuntimeMemoryBeforeTurn(params: {
  commandBody: string;
  env?: NodeJS.ProcessEnv;
  bridgeContext?: BridgeContextInfo;
}): Promise<RuntimeMemoryPromptIntegration> {
  const service = createRuntimeMemoryService(params.env);

  let bridgeHints = null;
  let bridgeHintsSource: "bridge" | "default" = "default";

  if (params.bridgeContext?.consumed) {
    bridgeHints = {
      namespaces: [],
      isHintOnly: true,
      source: "bridge" as const,
    };
    if (params.bridgeContext.resolutionState === "resolved") {
      bridgeHintsSource = "bridge";
    }
  }

  const readResult = await service.preparePrompt({
    prompt: params.commandBody,
    queryText: params.commandBody,
    bridgeHints: bridgeHints ?? undefined,
  });

  const namespaceHints =
    readResult.namespaceHints.length > 0
      ? readResult.namespaceHints
      : [service.getStatus().defaultNamespace];

  return {
    commandBody: readResult.prompt,
    injected: readResult.injected,
    injectedRecords: readResult.results.length,
    namespaceHints,
    bridgeHintsSource,
  };
}

function extractAssistantText(payloads: ReplyPayload[]): string {
  const text = payloads
    .filter((payload) => !payload.isError && typeof payload.text === "string")
    .map((payload) => payload.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n")
    .trim();
  if (text.length <= 4000) {
    return text;
  }
  return `${text.slice(0, 4000).trimEnd()}...`;
}

export async function applyRuntimeMemoryCaptureAfterTurn(params: {
  userText: string;
  payloads: ReplyPayload[];
  env?: NodeJS.ProcessEnv;
}): Promise<{ captured: number; skipped: boolean }> {
  const assistantText = extractAssistantText(params.payloads);
  const service = createRuntimeMemoryService(params.env);
  return service.captureFromTurn({
    userText: params.userText,
    assistantText,
  });
}
