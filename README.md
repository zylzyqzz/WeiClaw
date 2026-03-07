# WeiClaw Private

WeiClaw is a private, learning-focused subtractive edition based on OpenClaw.
This repo keeps upstream license, attribution, and notice obligations intact.
This is the author's first project for hands-on learning and private self-hosted use.

- Upstream: https://github.com/openclaw/openclaw
- License: [LICENSE](LICENSE)
- Attribution/notice: [NOTICE.md](NOTICE.md)

## Positioning

WeiClaw is intentionally reduced for private self-use.
The default product path is:

- Telegram-first channel flow
- OpenAI-compatible provider flow
- OpenClaw-native skills compatibility (`skills` loader + `SKILL.md` + skills scan)
- Automation/scheduler retained
- Control UI / Dashboard retained
- Terminal onboarding/setup retained
- Terminal TUI retained

What this repo is not:

- not a full OpenClaw channel/provider matrix distribution
- not a claim of full originality independent of OpenClaw

## Quick Start (Telegram-first)

Requirements:

- Node 22+

Install and onboard:

```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

Start gateway (default port `19789`):

```bash
openclaw gateway --port 19789
```

Open dashboard:

- `http://127.0.0.1:19789/`

## Default Runtime Profile

WeiClaw defaults are narrowed for private usage:

- main channel: Telegram
- primary provider route: OpenAI-compatible
- private mode defaults: relaxed confirmation/security defaults (can still be tightened by config)

## Core Commands

```bash
openclaw onboard
openclaw status
openclaw dashboard
openclaw tui
openclaw skills list
openclaw cron list
```

## Minimal Usable Loop (Local Verification)

This round focuses on a real, minimal run loop (without cloud deploy and without real keys committed).

### 1) Telegram-first task loop

Minimal Telegram fields:

- `channels.telegram.enabled`
- `channels.telegram.botToken` (or env `TELEGRAM_BOT_TOKEN`)

Verify quickly:

```bash
openclaw config get channels.telegram.enabled
openclaw config get channels.telegram.botToken
openclaw channels status --probe
```

For real message execution, set a valid bot token in env and send a Telegram message to the bot.

### 2) OpenAI-compatible provider loop

Default supported route in WeiClaw:

- `openai-api-key` (OpenAI-compatible)
- `litellm-api-key` (OpenAI-compatible gateway for providers like aliyun/unicom/nvidia equivalents)

Minimal setup path:

```bash
openclaw onboard --auth-choice openai-api-key
# or
openclaw onboard --auth-choice litellm-api-key
```

Config is stored under:

- `agents.defaults.model.primary`
- `agents.defaults.models`
- `models.providers.<provider>`
- `auth.profiles`

Check and diagnose:

```bash
openclaw status
openclaw doctor
```

### 3) Core skills loop (4 core skills)

WeiClaw keeps these core execution skills in the default runtime:

- `exec` (`shell_command` alias supported)
- `read` (`file_read` alias supported)
- `write` (`file_write` alias supported)
- `web_fetch` (`http_request` alias supported)

### 4) Automation/scheduler loop

Minimal cron loop:

```bash
openclaw cron add --help
openclaw cron list
openclaw cron enable <id>
openclaw cron disable <id>
```

The scheduler chain is retained as first-class default capability in WeiClaw.

## Notes

- This project is not trying to preserve the full upstream channel/provider matrix in default user-facing flow.
- Upstream compatibility foundations are retained where required (license, attribution, skills compatibility, scheduler, Dashboard/TUI/onboarding).
- If you need wider channel/provider exposure, enable the corresponding environment overrides explicitly.
