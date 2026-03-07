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

## Notes

- This project is not trying to preserve the full upstream channel/provider matrix in default user-facing flow.
- Upstream compatibility foundations are retained where required (license, attribution, skills compatibility, scheduler, Dashboard/TUI/onboarding).
- If you need wider channel/provider exposure, enable the corresponding environment overrides explicitly.
