---
summary: "How WeiClaw keeps one install entry while reserving a future Core extension slot."
title: "Runtime Extension Plan"
---

# Runtime Extension Plan

WeiClaw remains the single public install entry for users.

## What stays true

- Users install `WeiClaw`, not `WeiClaw-Core`.
- The current public WeiClaw release can install and run on its own.
- The public repository does not contain private Core artifacts or closed-source runtime bundles.

## Why an extension slot exists

WeiClaw-Core is a private enhancement layer, not a separate public product entry.
Some future enhanced capabilities may be connected through the same install chain so delivery can stay unified for users.

That extension slot exists to make the install path predictable and maintainable:

- the public installer can detect whether a Core extension plan was requested
- the public installer can record a placeholder source label
- the public installer can continue with the normal public install path when no extension is enabled

## What the public repo includes today

The public installer may read placeholder configuration such as:

- `WEICLAW_CORE_EXTENSION_ENABLED`
- `WEICLAW_CORE_EXTENSION_SOURCE`

These placeholders only reserve structure. They do not download, unpack, or activate any private Core implementation from this repository.

## v2.0.5 Core Bridge seam

WeiClaw `v2.0.5` adds a runtime Core Bridge handoff seam for normalized channel events.

- Supported public sources: Telegram, WeCom, Feishu normalized inbound events
- Bridge config is opt-in and defaults to disabled
- Default mode is `noop`; optional `http` mode can hand off events to an external bridge endpoint
- If bridge is disabled, unavailable, or times out, WeiClaw falls back to the public standalone path

Bridge env variables:

- `WEICLAW_CORE_BRIDGE_ENABLED`
- `WEICLAW_CORE_BRIDGE_MODE` (`noop` or `http`)
- `WEICLAW_CORE_BRIDGE_ENDPOINT`
- `WEICLAW_CORE_BRIDGE_TIMEOUT_MS`

This seam only defines a stable extension handoff. It does not include private Core ownership, claim, channel identity mapping, or memory control-plane logic.

## Public and private responsibility split

WeiClaw public repo:

- public install entry
- open docs
- public onboarding and setup flow
- public runtime packaging and fallback flow
- community-visible mainline features

WeiClaw-Core private repo:

- closed-source enhancement capabilities
- private runtime bundles or extension bundles
- ownership, memory, device, control-plane, and commercial layers that should not live in the public repo

## Result

The install experience stays unified for users, while the repository boundary stays clean for developers.
