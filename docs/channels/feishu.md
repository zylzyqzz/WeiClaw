---
summary: "WeiClaw v2.0.1 optional Feishu channel foundation"
read_when:
  - You want to enable the Feishu adapter skeleton in WeiClaw
  - You need the v2.0.1 Feishu config and webhook path fields
title: "Feishu"
---

# Feishu

WeiClaw `v2.0.1` adds an optional **Feishu** channel foundation in the public repo. This layer is
meant to establish the adapter, config, webhook, doctor, and routing spine. It does not replace the
existing Telegram-first public mainline and it does not include any private-core implementation.

## Required configuration

- `WEICLAW_FEISHU_ENABLED`
- `WEICLAW_FEISHU_APP_ID`
- `WEICLAW_FEISHU_APP_SECRET`
- `WEICLAW_FEISHU_VERIFICATION_TOKEN`
- `WEICLAW_FEISHU_ENCRYPT_KEY`
- `WEICLAW_FEISHU_WEBHOOK_PATH`

Example:

```bash
export WEICLAW_FEISHU_ENABLED=1
export WEICLAW_FEISHU_APP_ID="cli_example"
export WEICLAW_FEISHU_APP_SECRET="secret"
export WEICLAW_FEISHU_VERIFICATION_TOKEN="verify-token"
export WEICLAW_FEISHU_ENCRYPT_KEY="encrypt-key"
export WEICLAW_FEISHU_WEBHOOK_PATH="/channels/feishu/webhook"
```

## webhookPath

`webhookPath` is the route segment WeiClaw uses to match inbound Feishu webhook requests. In
`v2.0.1`, the default path is:

```text
/channels/feishu/webhook
```

## What the v2.0.1 foundation supports

- Config loading from environment variables
- Webhook path matching
- URL verification handling
- Minimal inbound text message parsing
- Minimal outbound text reply formatting
- Status, doctor, and self-test hooks

## What is not supported yet

- Media, image, file, or voice message handling
- Full Feishu app lifecycle automation
- Owner binding, memory mapping, or private identity logic

## Validate locally

```bash
openclaw channels china-status
openclaw channels china-doctor
openclaw channels china-test
```

Use these commands to confirm whether the Feishu adapter is enabled, whether required fields are
present, and whether the local route skeleton handles URL verification and sample text events.
