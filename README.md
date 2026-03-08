# WeiClaw

WeiClaw is a minimal private execution assistant based on OpenClaw.

WeiClaw is a personal learning and self-hosted subtraction build. It keeps upstream OpenClaw license, attribution, NOTICE, and the compatibility foundation required for skills and runtime behavior. User-facing branding is WeiClaw, the primary CLI is `weiclaw`, and `openclaw` remains as a compatibility alias.

## What It Is

WeiClaw focuses on a smaller first path:
- `weiclaw` as the main CLI
- Telegram or Feishu as the first external channel
- TUI as the main local interaction surface
- OpenAI-compatible model routes
- Skills compatibility
- Automation and scheduler support

WeiClaw is not trying to be a full browser-first OpenClaw product surface. Optional UI, browser, canvas, and A2UI compatibility code may still exist internally, but they are no longer part of the normal install and run path.

## Current Positioning

WeiClaw is for people who want:
- a private execution assistant they can install quickly
- a terminal-first workflow they can understand
- a focused runtime without the full development repository as the normal delivery path

WeiClaw is not currently optimized for:
- browser dashboard as the default surface
- multi-channel product marketing matrix
- full UI/browser/canvas first-run onboarding
- multi-agent product workflows

## Core Features

- Telegram channel
- Feishu channel via on-demand plugin install
- TUI
- `setup`, `onboard`, `doctor`, `status`, `configure`
- OpenClaw-compatible skills loader, `SKILL.md`, and skills directory scanning
- Automation and scheduler
- OpenAI-compatible model configuration
- gateway runtime on port `19789`

## Who It Is For

- people who want a private execution assistant with a simple terminal-first workflow
- people who want a short install path instead of cloning the full development repo
- developers who want OpenClaw compatibility with a smaller delivery surface

## One-Command Install

The installation is **quiet and minimal** by default. You'll only see essential progress messages.

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/zylzyqzz/WeiClaw/main/scripts/bootstrap/install.sh | bash
```

For verbose mode:
```bash
WEICLAW_VERBOSE=1 curl -fsSL https://raw.githubusercontent.com/zylzyqzz/WeiClaw/main/scripts/bootstrap/install.sh | bash
```

### Windows PowerShell

```powershell
iwr -useb https://raw.githubusercontent.com/zylzyqzz/WeiClaw/main/scripts/bootstrap/install.ps1 | iex
```

For verbose mode:
```powershell
$env:WEICLAW_VERBOSE=1; iwr -useb https://raw.githubusercontent.com/zylzyqzz/WeiClaw/main/scripts/bootstrap/install.ps1 | iex
```

The bootstrap installer will:
- check `git`, `node`, and `npm`
- install missing prerequisites when possible
- install the minimal WeiClaw runtime package instead of the full development repository
- run the short bootstrap flow
- write the minimum working config
- optionally open TUI immediately

## First-Run Flow

The normal first path is fixed to this sequence:
1. show the WeiClaw red `W` terminal logo
2. choose model
3. choose channel
4. enter only the selected channel credentials
5. choose whether to open TUI now

Example:

```text
WeiClaw
极简私有助手 / Minimal private agent

请选择模型 / Select model
1. qianfan/deepseek-v3.2      推荐 / Recommended
2. kimi-coding/k2p5          代码 / Coding
3. moonshot/kimi-k2.5        推理 / Reasoning
4. Custom                    自定义 / Advanced

请选择通道 / Select channel
1. Telegram
2. Feishu

请输入 Telegram Bot Token / Enter Telegram Bot Token

是否立即打开 TUI？/ Open TUI now? [Y/n]
```

If you choose Feishu, WeiClaw installs the Feishu plugin on demand instead of shipping that plugin in the default minimal runtime package.

## Quick Start

Start the gateway:

```bash
npm run start
```

Check status:

```bash
weiclaw status
```

Open TUI:

```bash
weiclaw tui
```

Run health checks:

```bash
weiclaw doctor
```

Adjust advanced settings:

```bash
weiclaw configure
```

Run the advanced onboarding wizard:

```bash
weiclaw onboard
```

Re-run the minimal bootstrap:

```bash
weiclaw setup --bootstrap
```

## Command Overview

- `weiclaw`: main user-facing command
- `weiclaw setup`: initialize config and workspace
- `weiclaw setup --bootstrap`: minimal first-run setup
- `weiclaw onboard`: advanced onboarding wizard
- `weiclaw tui`: terminal UI
- `weiclaw status`: runtime and channel status
- `weiclaw doctor`: health checks and repairs
- `weiclaw configure`: advanced interactive configuration
- `openclaw`: compatibility alias only

## Model Configuration

WeiClaw keeps the normal install path intentionally small.

Recommended:
- `qianfan/deepseek-v3.2`: balanced default
- `kimi-coding/k2p5`: coding-oriented
- `moonshot/kimi-k2.5`: reasoning/general work

Advanced:
- `Custom`: enter your own OpenAI-compatible base URL and model id

The bootstrap flow asks for the matching API key only when it matters. You can also leave the field blank and provide the environment variable later.

## Channel Configuration

### Telegram

Minimal first path:
- enable Telegram
- ask only for `Telegram Bot Token`
- keep DM policy open by default for private self-hosted use

### Feishu

Current state:
- repository support exists as the `@openclaw/feishu` plugin
- the normal install path supports Feishu selection
- the default runtime package does not include Feishu by default
- Feishu is installed on demand when selected

Minimal first path:
- install Feishu plugin only when needed
- ask only for `Feishu App ID`
- ask only for `Feishu App Secret`
- default to WebSocket mode

## Update And Deployment

### Local verify commands

```bash
npm exec pnpm -- tsgo
npm exec pnpm -- build
npm exec pnpm -- weiclaw --help
npm exec pnpm -- weiclaw status --help
npm exec pnpm -- openclaw --help
```

### Local workspace push

```powershell
cd E:\WeiClaw
git remote remove origin 2>$null
git remote add origin git@github.com:zylzyqzz/WeiClaw.git
git add .
git commit -m "feat(installer): add minimal bootstrap runtime delivery"
git branch -M main
git push -u origin main
```

### Server update and restart

```bash
cd /opt/WeiClaw
git fetch --all --prune
git reset --hard origin/main
npm exec pnpm -- install --frozen-lockfile
npm exec pnpm -- build
pkill -f "scripts/run-node.mjs gateway" || true
pkill -f "dist/src/cli/run.js gateway" || true
if [ -f .env.local ]; then
  set -a
  . ./.env.local
  set +a
fi
nohup npm run start >/tmp/weiclaw-start.log 2>&1 &
sleep 3
ss -ltnp | grep 19789 || true
tail -n 120 /tmp/weiclaw-start.log
```

## Runtime Package And Delivery Shape

WeiClaw now distinguishes between:
- development repository
- minimal runtime package

The default install path is intended to use the runtime package, not a full Git checkout.

The runtime package focuses on:
- `dist/`
- `openclaw.mjs`
- `skills/`
- bundled Telegram path
- `README.md`, `LICENSE`, `NOTICE.md`, `CHANGELOG.md`

The default runtime package excludes the normal development bulk where possible:
- `src/`
- tests
- docs
- fixtures
- snapshots
- examples
- source maps
- non-default UI/browser assets in the first path
- Feishu plugin payload unless selected

Generate the runtime package locally:

```bash
npm exec pnpm -- runtime:pack
```

## Architecture And Trimming Notes

Main chain kept in WeiClaw:
- `weiclaw` main CLI
- `openclaw` compatibility alias
- TUI
- Telegram
- setup / onboard / doctor / status / configure
- skills loader and `SKILL.md` compatibility
- automation / scheduler
- OpenAI-compatible provider routes

Optional or downgraded paths:
- browser / dashboard / control UI compatibility chain
- canvas host
- vendor A2UI assets
- optional Feishu plugin delivery

The product direction is simple: keep the execution chain stable, keep the install path short, and isolate optional capability behind explicit choice instead of default weight.

## FAQ

### Installation feels slow. What should I check?

Check your network path to GitHub releases and npm registry. The normal path should install the runtime package, not clone the full repo.

### Why is UI no longer exposed by default?

WeiClaw is being cut down into a terminal-first private product surface. UI/browser/canvas code still exists internally in places, but it is no longer part of the normal path.

### How do I choose between Telegram and Feishu?

Choose Telegram for the lightest path. Choose Feishu if your workflow is already on Feishu or Lark and you are fine with plugin-on-demand installation.

### What is TUI?

TUI is the terminal UI. It is the main local interaction surface in WeiClaw.

### How do I reconfigure later?

Use:
- `weiclaw setup --bootstrap`
- `weiclaw configure`
- `weiclaw doctor`
- `weiclaw status`

### Why does `openclaw` still exist?

It stays as a compatibility alias so existing scripts and habits do not break immediately. WeiClaw is the main user-facing name.

### Why are model names in `provider/model` form?

WeiClaw keeps an OpenAI-compatible routing model. `provider/model` is the clearest way to show the provider boundary and the actual remote model id.

## Project Status

Already done:
- main CLI surface rebranded to WeiClaw
- default port unified to `19789`
- default UI/browser path removed from normal flow
- default security posture loosened for private self-use
- start/build/tsgo/help main path stabilized
- bootstrap runtime packaging started

Not fully finished yet:
- deeper UI/browser/canvas compatibility chain still needs more optionalization and deletion
- runtime package and GitHub release flow still need polish
- Feishu path is usable, but still depends on plugin-on-demand delivery

Most stable path today:
- install via bootstrap script
- choose a recommended model
- choose Telegram
- open TUI
- use `weiclaw status`, `weiclaw doctor`, and `weiclaw configure` for advanced control

## Next Development Path

Detailed next-step plan lives in `ROADMAP.md`.

## License / Attribution / Upstream

WeiClaw is based on OpenClaw and keeps the upstream license and attribution.

Do not remove:
- `LICENSE`
- `NOTICE.md`
- upstream attribution and source statements required by the project history
