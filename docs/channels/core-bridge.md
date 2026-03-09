---
summary: "WeiClaw v2.0.5 Core Bridge extension seam for optional channel-to-Core handoff."
title: "Core Bridge"
---

# Core Bridge

WeiClaw `v2.0.5` adds a public Core Bridge seam so normalized channel events can be handed off to a future private Core integration.

This is an extension slot, not a private implementation.

## Scope in public WeiClaw

- Defines a stable inbound event payload shape for bridge handoff
- Supports handoff sources from normalized Telegram, WeCom, and Feishu flows
- Provides `noop` and `http` bridge modes
- Provides status and doctor commands for bridge observability

## Not included in public WeiClaw

- owner / claim / provisioning logic
- channel identity mapping logic
- memory ownership control plane
- any private Core endpoint, key, or token implementation

## Configuration

- `WEICLAW_CORE_BRIDGE_ENABLED`
  - `false` by default
- `WEICLAW_CORE_BRIDGE_MODE`
  - `noop` by default
  - optional: `http`
- `WEICLAW_CORE_BRIDGE_ENDPOINT`
  - required only when `WEICLAW_CORE_BRIDGE_MODE=http`
- `WEICLAW_CORE_BRIDGE_TIMEOUT_MS`
  - timeout for `http` mode handoff

## Runtime behavior

1. Channel event is normalized in public channel adapter/router flow.
2. Bridge handoff is attempted only when enabled.
3. If bridge is disabled, unavailable, or errors, WeiClaw logs fallback and keeps running public standalone logic.

This keeps Telegram-first public behavior stable while leaving a clear extension seam for future private Core handling.

## CLI checks

- `openclaw core-bridge status`
- `openclaw core-bridge doctor`
- `openclaw channels china-status`
- `openclaw channels china-doctor`

The status output includes bridge mode, endpoint, timeout, readiness, and detected issues.
