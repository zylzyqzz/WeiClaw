import type { MemorySearchResult } from "../core-types.js";

const DEFAULT_CONTEXT_LIMIT = 1200;

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }
  return `${text.slice(0, Math.max(0, maxChars - 3)).trimEnd()}...`;
}

export function buildMemoryContextSnippet(params: {
  results: MemorySearchResult[];
  contextLimit?: number;
}): string | null {
  const contextLimit = Math.max(100, params.contextLimit ?? DEFAULT_CONTEXT_LIMIT);
  if (params.results.length === 0) {
    return null;
  }
  const lines: string[] = [];
  let consumed = 0;
  for (const result of params.results) {
    const content = result.content.trim();
    if (!content) {
      continue;
    }
    const line = `- ${truncate(content.replace(/\s+/g, " "), 220)}`;
    const projected = consumed + line.length + 1;
    if (projected > contextLimit) {
      break;
    }
    lines.push(line);
    consumed = projected;
  }
  if (lines.length === 0) {
    return null;
  }
  return [
    "Long-term memory context (WeiClaw public memory-core v2.0.3):",
    ...lines,
    "",
    "Use this only as supporting context. Prioritize the current user request.",
  ].join("\n");
}

export function injectMemoryContextIntoPrompt(params: {
  prompt: string;
  contextSnippet: string | null;
}): string {
  if (!params.contextSnippet) {
    return params.prompt;
  }
  return `${params.contextSnippet}\n\nCurrent user request:\n${params.prompt}`;
}
