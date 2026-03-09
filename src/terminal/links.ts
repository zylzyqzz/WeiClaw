import { formatTerminalLink } from "../utils.js";

// WeiClaw docs root - can be customized for private deployments
export const WEICLAW_DOCS_ROOT = process.env.WEICLAW_DOCS_ROOT || "https://docs.weiclaw.ai";
export const DOCS_ROOT = WEICLAW_DOCS_ROOT;

export function formatDocsLink(
  path: string,
  label?: string,
  opts?: { fallback?: string; force?: boolean },
): string {
  const trimmed = path.trim();
  const url = trimmed.startsWith("http")
    ? trimmed
    : `${DOCS_ROOT}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
  return formatTerminalLink(label ?? url, url, {
    fallback: opts?.fallback ?? url,
    force: opts?.force,
  });
}

export function formatDocsRootLink(label?: string): string {
  return formatTerminalLink(label ?? DOCS_ROOT, DOCS_ROOT, {
    fallback: DOCS_ROOT,
  });
}
