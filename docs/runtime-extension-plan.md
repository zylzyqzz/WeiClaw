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
