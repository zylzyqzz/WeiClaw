---
summary: "WeiClaw v2.0.1 optional WeCom and Feishu channel adapter foundation"
read_when:
  - You are evaluating China-region channel support in WeiClaw
  - You want to understand what v2.0.1 adds for WeCom and Feishu
title: "China Channel Foundation"
---

# China Channel Foundation

WeiClaw `v2.0.1` adds an optional China-region dual-channel foundation for **WeCom** and **Feishu**.
This is a public channel adapter layer, not a new default mainline. Telegram-first,
OpenAI-compatible-first, TUI, setup, onboard, doctor, skills, and automation stay on the existing
public path.

## What v2.0.1 adds

- A shared `ChannelAdapter` skeleton for optional China-region adapters
- `WeCom` adapter foundation for config loading, webhook path matching, text parsing, and text reply formatting
- `Feishu` adapter foundation for config loading, webhook path matching, text parsing, URL verification handling, and text reply formatting
- Channel doctor, status, and self-test commands
- Webhook router skeleton and shared message normalization

## What v2.0.1 does not add

- No default onboarding switch to WeCom or Feishu
- No private identity, ownership, memory, or claim logic
- No WeiClaw-Core implementation in the public repo
- No production-grade media, file, image, or voice support yet

## Optional configuration

The two adapters stay disabled unless explicitly enabled.

### WeCom

- `WEICLAW_WECOM_ENABLED`
- `WEICLAW_WECOM_CORP_ID`
- `WEICLAW_WECOM_CORP_SECRET`
- `WEICLAW_WECOM_AGENT_ID`
- `WEICLAW_WECOM_TOKEN`
- `WEICLAW_WECOM_ENCODING_AES_KEY`
- `WEICLAW_WECOM_WEBHOOK_PATH`

### Feishu

- `WEICLAW_FEISHU_ENABLED`
- `WEICLAW_FEISHU_APP_ID`
- `WEICLAW_FEISHU_APP_SECRET`
- `WEICLAW_FEISHU_VERIFICATION_TOKEN`
- `WEICLAW_FEISHU_ENCRYPT_KEY`
- `WEICLAW_FEISHU_WEBHOOK_PATH`

## CLI checks

```bash
openclaw channels china-status
openclaw channels china-doctor
openclaw channels china-test
```

`china-status` reports enablement and webhook paths.
`china-doctor` reports whether required config fields are present.
`china-test` runs a local route self-check against the v2.0.1 webhook skeleton.

## Boundary with WeiClaw-Core

The public repo only carries the channel adapter layer. Any future mapping from WeCom or Feishu
users into owner identity, long-term memory, device ownership, or commercial/private flows belongs
to `WeiClaw-Core`, not this public repository.
