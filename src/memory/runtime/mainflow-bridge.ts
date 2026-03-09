import type { ReplyPayload } from "../../auto-reply/types.js";
import { createRuntimeMemoryService } from "./runtime-memory-service.js";

export type RuntimeMemoryPromptIntegration = {
  commandBody: string;
  injected: boolean;
  injectedRecords: number;
};

export async function applyRuntimeMemoryBeforeTurn(params: {
  commandBody: string;
  env?: NodeJS.ProcessEnv;
}): Promise<RuntimeMemoryPromptIntegration> {
  const service = createRuntimeMemoryService(params.env);
  const readResult = await service.preparePrompt({
    prompt: params.commandBody,
    queryText: params.commandBody,
  });
  return {
    commandBody: readResult.prompt,
    injected: readResult.injected,
    injectedRecords: readResult.results.length,
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
