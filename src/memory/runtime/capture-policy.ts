export type MemoryCaptureKind = "preference" | "profile" | "task-fact" | "note";

export type MemoryCaptureCandidate = {
  kind: MemoryCaptureKind;
  content: string;
};

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

function classifyKind(text: string): MemoryCaptureKind | null {
  const lower = text.toLowerCase();
  if (
    lower.includes("prefer") ||
    lower.includes("preference") ||
    lower.includes("please use") ||
    lower.includes("always use")
  ) {
    return "preference";
  }
  if (lower.includes("my name is") || lower.includes("i am ") || lower.includes("i'm ")) {
    return "profile";
  }
  if (
    lower.includes("remember") ||
    lower.includes("task") ||
    lower.includes("todo") ||
    lower.includes("deadline")
  ) {
    return "task-fact";
  }
  if (text.length >= 20) {
    return "note";
  }
  return null;
}

function splitSentences(text: string): string[] {
  return text
    .split(/[.!?;\n]+/g)
    .map((part) => normalize(part))
    .filter(Boolean);
}

export function selectCaptureCandidates(params: {
  userText?: string;
  assistantText?: string;
  maxCandidates?: number;
}): MemoryCaptureCandidate[] {
  const maxCandidates = Math.max(1, params.maxCandidates ?? 3);
  const candidates: MemoryCaptureCandidate[] = [];
  const pushCandidate = (raw: string) => {
    if (candidates.length >= maxCandidates) {
      return;
    }
    const content = normalize(raw);
    if (content.length < 8 || content.length > 500) {
      return;
    }
    const kind = classifyKind(content);
    if (!kind) {
      return;
    }
    if (candidates.some((entry) => entry.content === content)) {
      return;
    }
    candidates.push({ kind, content });
  };

  for (const sentence of splitSentences(params.userText ?? "")) {
    pushCandidate(sentence);
  }
  for (const sentence of splitSentences(params.assistantText ?? "")) {
    pushCandidate(sentence);
  }
  return candidates;
}
