---
summary: "WeiClaw 运维命令：更新、回滚、恢复、配置管理"
read_when:
  - 需要更新 WeiClaw
  - 需要回滚版本
  - 配置损坏需要恢复
  - 需要重新配置模型/通道/TUI
title: "运维命令"
---

# WeiClaw 运维命令

本文档提供 WeiClaw 的运维命令参考，包括更新、回滚、恢复和配置管理。

## 1. 更新 WeiClaw

### 1.1 重新运行安装脚本（推荐）

```bash
# 国际网络
curl -fsSL https://raw.githubusercontent.com/zylzyqzz/WeiClaw/main/scripts/bootstrap/install.sh | bash

# 中国大陆（推荐）
curl -fsSL https://cdn.jsdelivr.net/gh/zylzyqzz/WeiClaw@main/scripts/bootstrap/install.sh | bash

# Windows PowerShell
iwr -useb https://cdn.jsdelivr.net/gh/zylzyqzz/WeiClaw@main/scripts/bootstrap/install.ps1 | iex
```

安装器会自动检测并升级现有安装。

### 1.2 指定版本更新

```bash
# 使用自定义 tarball
WEICLAW_INSTALL_TARBALL="https://github.com/zylzyqzz/WeiClaw/releases/latest/download/weiclaw-runtime.tgz" bash -c "$(curl -fsSL https://cdn.jsdelivr.net/gh/zylzyqzz/WeiClaw@main/scripts/bootstrap/install.sh)"
```

### 1.3 手动更新 npm 包

```bash
# 全局安装
npm install -g weiclaw@latest

# 或使用 pnpm
pnpm add -g weiclaw@latest
```

### 1.4 源码更新（开发模式）

```bash
cd ~/weiclaw  # 或你的源码目录
git pull
pnpm install
pnpm build
weiclaw doctor
weiclaw gateway restart
```

## 2. 回滚 WeiClaw

### 2.1 回滚到上一个版本

```bash
# 查看可用版本
npm view weiclaw versions

# 安装指定版本
npm install -g weiclaw@<version>
```

### 2.2 回滚到上一个 Tag/Commit

```bash
# 查看最近 tags
git tag | sort -V | tail -5

# 回滚到上一个 tag
git checkout <tag>

# 或回滚到上一个 commit
git checkout <commit-hash>

# 重新安装
pnpm install
pnpm build
```

### 2.3 按日期回滚

```bash
# 检出指定日期的版本
git fetch origin
git checkout "$(git rev-list -n 1 --before="2026-01-01" origin/main)"
```

## 3. 配置损坏恢复

### 3.1 备份配置

WeiClaw 配置文件位于 `~/.openclaw/openclaw.json`。建议定期备份。

```bash
# 备份配置
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.backup
```

### 3.2 使用 doctor 修复

```bash
weiclaw doctor
```

Doctor 命令会自动修复：

- 废弃的配置键
- 迁移旧配置文件位置
- 检测并修复 Gateway 服务

### 3.3 完全重置配置

```bash
# 删除配置文件（会丢失所有配置）
rm ~/.openclaw/openclaw.json

# 重新运行引导
weiclaw setup --bootstrap
```

### 3.4 重新跑 bootstrap

```bash
# 重新运行引导流程
weiclaw setup --bootstrap
```

## 4. 只重配特定组件

### 4.1 只重配模型

```bash
# 使用 config 命令
weiclaw config set agents.defaults.model.primary "provider/model"

# 或重新运行引导选择模型
weiclaw setup --bootstrap
```

### 4.2 只重配通道

Telegram:

```bash
# 修改 Telegram 配置
weiclaw config set channels.telegram.botToken "your-bot-token"
```

Feishu:

```bash
# 修改 Feishu 配置
weiclaw config set channels.feishu.appId "your-app-id"
weiclaw config set channels.feishu.appSecret "your-app-secret"
```

### 4.3 只重配 TUI

```bash
# 打开 TUI
weiclaw tui

# 或修改 TUI 配置
weiclaw config set tui.theme "dark"
```

## 5. 服务管理

### 5.1 查看状态

```bash
# 查看 Gateway 状态
weiclaw gateway status

# 查看健康状态
weiclaw health
```

### 5.2 重启服务

```bash
# 重启 Gateway
weiclaw gateway restart

# 停止 Gateway
weiclaw gateway stop

# 启动 Gateway
weiclaw gateway start
```

### 5.3 查看日志

```bash
# 查看实时日志
weiclaw logs --follow

# 查看最近日志
weiclaw logs
```

## 6. 非交互环境处理

### 6.1 SSH 环境

在非交互环境（如 SSH）中，安装后不会自动进入引导，需要手动运行：

```bash
weiclaw setup --bootstrap
```

### 6.2 跳过引导

```bash
# 跳过引导
WEICLAW_SKIP_BOOTSTRAP=1 bash -c "$(curl -fsSL https://cdn.jsdelivr.net/gh/zylzyqzz/WeiClaw@main/scripts/bootstrap/install.sh)"
```

## 7. 本地开发推送

如果你修改了 WeiClaw 代码并想推送到本地测试：

```bash
# 构建
pnpm build

# 链接本地包
npm link

# 或在项目目录运行
npm run start
```

## 8. 常见问题

### 8.1 版本显示不对

```bash
weiclaw --version
```

如果版本不对，可能是旧版残留，重新执行安装脚本。

### 8.2 npm run start 报 package.json not found

WeiClaw 默认通过全局安装的 runtime 包运行。如果需要在开发目录下运行：

```bash
cd ~/weiclaw  # 你的源码目录
npm run start
```

### 8.3 网络问题

安装器内置自动回退：

1. 官方 GitHub Release
2. ghproxy.net 代理（适合中国大陆）
3. 源码克隆（最终兜底）

如遇网络问题，安装器会自动切换，无需手动操作。
