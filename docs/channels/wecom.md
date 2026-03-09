---
summary: "WeiClaw v2.0.1 optional WeCom channel foundation"
read_when:
  - You want to enable the WeCom adapter skeleton in WeiClaw
  - You need the v2.0.1 WeCom config and webhook path fields
title: "WeCom"
---

# WeCom

WeiClaw `v2.0.1` adds an optional **WeCom** channel foundation in the public repo. It is a
channel adapter skeleton only, not a default mainline and not a private-core feature drop.

## Required configuration

- `WEICLAW_WECOM_ENABLED`
- `WEICLAW_WECOM_CORP_ID`
- `WEICLAW_WECOM_CORP_SECRET`
- `WEICLAW_WECOM_AGENT_ID`
- `WEICLAW_WECOM_TOKEN`
- `WEICLAW_WECOM_ENCODING_AES_KEY`
- `WEICLAW_WECOM_WEBHOOK_PATH`

Example:

```bash
export WEICLAW_WECOM_ENABLED=1
export WEICLAW_WECOM_CORP_ID="ww_example"
export WEICLAW_WECOM_CORP_SECRET="secret"
export WEICLAW_WECOM_AGENT_ID="1000002"
export WEICLAW_WECOM_TOKEN="token"
export WEICLAW_WECOM_ENCODING_AES_KEY="encoding-key"
export WEICLAW_WECOM_WEBHOOK_PATH="/channels/wecom/webhook"
```

## webhookPath

`webhookPath` is the route segment WeiClaw uses to match inbound WeCom webhook requests. In
`v2.0.1`, the default path is:

```text
/channels/wecom/webhook
```

The path is normalized before matching, so `/channels/wecom/webhook/` and
`channels/wecom/webhook` resolve to the same route.

## What the v2.0.1 foundation supports

- Config loading from environment variables
- Webhook path matching
- Minimal inbound text message parsing
- Minimal outbound text reply formatting
- Status, doctor, and self-test hooks

## What is not supported yet

- Media, image, file, or voice message handling
- Production token exchange or enterprise deployment workflow
- Owner binding, memory mapping, or private identity logic

## Validate locally

```bash
openclaw channels china-status
openclaw channels china-doctor
openclaw channels china-test
```

Use these commands to confirm whether the WeCom adapter is enabled, whether required fields are
present, and whether the local route skeleton matches a sample text webhook.
