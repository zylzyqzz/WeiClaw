# WeiClaw 极简私有助手

```
╔══════════════════╗
║    WeiClaw      ║
║  极简私有助手    ║
╚══════════════════╝
```

**Minimal private agent** - 面向个人与小团队的极简私有 AI 助手。

## 项目分层说明

WeiClaw 是公开主仓，也是当前对外安装和使用的主入口。

部分增强能力会在后续通过扩展包或运行包方式提供，但公开版本本身已经可以正常安装、启动和使用。

用户安装的是 WeiClaw，不需要直接安装任何私有核心仓。仓库分层用于代码边界管理，不改变统一安装入口。

边界文档：

- `docs/repo-boundary.md`
- `docs/development-guardrails.md`
- `docs/repo-routing-checklist.md`
- `docs/runtime-extension-plan.md`

WeiClaw 继续作为统一安装入口。后续某些增强能力可以通过安装链中的扩展位按需接入，但当前公开版本已经可以独立安装、启动和使用；公开仓不包含任何私有 Core 实现细节。

## 项目亮点

- **极简安装**：一行命令完成安装，自动引导配置
- **私有部署**：本地运行，数据不离开你的设备
- **多模型支持**：接入 OpenAI Compatible API（百度千帆、Moonshot、Kimi 等）
- **多通道接入**：Telegram、Feishu/Lark
- **终端交互**：内置 TUI，可在终端直接对话
- **国际/中国双入口**：全球网络与中国大陆网络分别优化

## 当前状态

### ✅ 已完成

- WeiClaw 主 CLI 及 `openclaw` 兼容别名
- Bootstrap 极简安装流程（选模型 → 选通道 → 填凭证 → 选 TUI）
- Telegram 通道完整支持
- Feishu/Lark 通道（需在引导流程中手动选择安装）
- 基础命令：`setup --bootstrap`、`configure`、`doctor`、`status`、`tui`
- Gateway 运行在端口 `19789`
- 国际/中国双安装入口

### 🔄 完善中

- npm runtime 包发布闭环（当前依赖 GitHub Release + ghproxy.net 回退）
- 更稳定的国内分发源

## 快速开始

### 国际网络安装

#### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/zylzyqzz/WeiClaw/main/scripts/bootstrap/install.sh | bash
```

#### Windows PowerShell

```powershell
iwr -useb https://raw.githubusercontent.com/zylzyqzz/WeiClaw/main/scripts/bootstrap/install.ps1 | iex
```

### 中国大陆安装

由于 `raw.githubusercontent.com` 在中国大陆可能无法访问，请使用 jsDelivr CDN 作为脚本入口。

#### macOS / Linux

```bash
curl -fsSL https://cdn.jsdelivr.net/gh/zylzyqzz/WeiClaw@main/scripts/bootstrap/install.sh | bash
```

#### Windows PowerShell

```powershell
iwr -useb https://cdn.jsdelivr.net/gh/zylzyqzz/WeiClaw@main/scripts/bootstrap/install.ps1 | iex
```

### 安装后会发生什么

1. 自动检测并安装 Git、Node.js（如未安装）
2. 下载并安装 runtime 包
3. 启动引导流程（Bootstrap）
4. 根据终端环境自动决定是否打开 TUI

安装器内部已经预留了未来 Core 扩展位。默认情况下不会启用，也不会依赖任何私有运行包；只有显式提供占位扩展开关时，安装器才会记录扩展计划并继续走当前公开安装路径。

## 引导安装流程

首次安装后会进入引导流程，按提示完成配置：

```
WeiClaw
Minimal private agent

请选择接入方案 / Select plan
1. Coding Plan         推荐 / Recommended
2. 自定义 / Custom

请选择云服务商 / Select provider
1. 阿里云百炼
2. 火山引擎
3. 腾讯云
4. 百度千帆
5. 联通云

连接地址 / Endpoint: https://coding.dashscope.aliyuncs.com/v1 (示例)

请选择模型 / Select model
1. qwen3.5-plus
2. qwen3-coder-next
...

请输入 API Key...

请选择通道 / Select channel
1. Telegram
2. Feishu

请输入 Telegram Bot Token / Enter Telegram Bot Token
```

### Coding Plan 云服务商说明

选择 Coding Plan 后，可选择以下云服务商：

- **阿里云百炼**：默认推荐，预置 URL `https://coding.dashscope.aliyuncs.com/v1`
- **火山引擎**：预置 URL `https://ark.cn-beijing.volces.com/api/coding/v3`
- **腾讯云**：预置 URL `https://api.lkeap.cloud.tencent.com/coding/v3`
- **百度千帆**：预置 URL `https://qianfan.baidubce.com/v2/coding`
- **联通云**：预置 URL `https://aigw-gzgy2.cucloud.cn:8443/v1`
- **自定义**：完全手动填写 URL、模型、API Key

### 安装后行为

- **交互式终端**：安装完成后自动进入引导流程
- **非交互式终端**（如 SSH）：安装完成后显示下一步命令 `weiclaw setup --bootstrap`

### TUI 自动打开行为

- **适合自动打开 TUI 的环境**：本地交互终端
- **不适合自动打开的环境**：SSH 远程、Termux 手机终端等，会显示提示信息

### Linux 后台运行

- **自动后台运行**：Linux 系统上，引导流程完成后自动安装 systemd user service
- **关闭终端后服务继续运行**：通过 systemd linger 实现，关闭 SSH/终端后服务仍在后台运行
- **服务状态**：可通过 `weiclaw status` 查看服务状态
- **手动管理**：

  ```bash
  # 查看服务状态
  systemctl --user status weiclaw

  # 重启服务
  systemctl --user restart weiclaw

  # 停止服务
  systemctl --user stop weiclaw
  ```

### 通道配置

- **Telegram**：只需 Bot Token，最轻量
  - **自动 webhook 清理**：使用 polling 模式时自动检测并清理残留 webhook，避免"服务活着但机器人不回话"
- **Feishu/Lark**：需要 App ID + App Secret，引导流程中可选
  - **自动处理已存在插件**：如果插件目录已存在，自动使用更新模式安装

## 常用命令

```bash
# 启动 Gateway
npm run start

# 重新执行引导配置
weiclaw setup --bootstrap

# 打开终端界面
weiclaw tui

# 查看状态
weiclaw status

# 健康检查与修复
weiclaw doctor

# 高级配置
weiclaw configure

# 高级引导（完整功能）
weiclaw onboard
```

`openclaw` 作为兼容别名保留，与 `weiclaw` 等效。

## 升级方式

### 重新安装（推荐）

```bash
# 国际网络
curl -fsSL https://raw.githubusercontent.com/zylzyqzz/WeiClaw/main/scripts/bootstrap/install.sh | bash

# 中国大陆
curl -fsSL https://cdn.jsdelivr.net/gh/zylzyqzz/WeiClaw@main/scripts/bootstrap/install.sh | bash
```

安装器会自动处理升级。

### 手动指定 runtime 包

```bash
WEICLAW_INSTALL_TARBALL="https://github.com/zylzyqzz/WeiClaw/releases/latest/download/weiclaw-runtime.tgz" bash -c "$(curl -fsSL https://cdn.jsdelivr.net/gh/zylzyqzz/WeiClaw@main/scripts/bootstrap/install.sh)"
```

## 故障排查

### GitHub 下载慢 / 失败

安装器内置自动回退：

1. 官方 GitHub Release
2. ghproxy.net 代理（适合中国大陆）
3. 源码克隆（最终兜底）

如遇网络问题，安装器会自动切换，无需手动操作。

### 引导流程被取消怎么办

```bash
weiclaw setup --bootstrap
```

### 版本显示不对

```bash
weiclaw --version
```

如版本不对，可能是旧版残留，重新执行安装即可。

### npm run start 报 package.json not found

WeiClaw 默认通过全局安装的 runtime 包运行，不需要在项目目录下执行。

如果需要在开发目录下运行：

```bash
npm run start
```

### 如何重新执行引导

```bash
weiclaw setup --bootstrap
```

## 安装分发闭环状态

### ✅ 已闭环

- **Bootstrap 安装入口**：国际/中国双入口（GitHub raw + jsDelivr CDN）
- **Runtime 下载回退链**：
  1. 官方 GitHub Release
  2. ghproxy.net 代理镜像
  3. 源码克隆（最终兜底，包含 Gitee 镜像）
- **引导流程**：交互式/非交互式自动适配
- **一键更新**：重新运行安装脚本即可升级

### ⏳ 完善中

- **npm 发布**：`@weiclaw/runtime` 尚未发布到 npm（需要先完成 npm 发布流程）
- **国内 CDN**：目前依赖 ghproxy.net 第三方服务

## 运维命令

详细运维命令请参考 [运维文档](./docs/install/weiclaw-ops.md)，包括：

- 更新 WeiClaw
- 回滚版本
- 配置损坏恢复
- 只重配模型/通道/TUI
- 服务管理

## 当前限制

- **jsDelivr**：仅作为脚本入口的备用源，不可直接镜像 runtime .tgz 包
- **npm fallback**：尚未发布 `@weiclaw/runtime` 到 npm，暂不作为默认回退链
- **国内分发**：依赖 GitHub Release + ghproxy.net 第三方公共服务

## License / Attribution

WeiClaw 基于上游开源项目持续演进，保留相关开源协议与归属声明。

保留文件：

- `LICENSE`
- `NOTICE.md`
- 上游归属声明

## v2.0.1 China channel foundation

WeiClaw `v2.0.1` adds optional public channel foundations for **WeCom** and **Feishu**.
They are adapter-layer skeletons only: config loading, webhook route matching, text normalization,
and doctor/status/test hooks.

They are **not** the default mainline, and they do **not** include any private WeiClaw-Core
identity, memory, ownership, or commercial implementation.

Docs:

- `/channels/china-channel-foundation`
- `/channels/wecom`
- `/channels/feishu`

## v2.0.2 memory-core public mainline

WeiClaw `v2.0.2` promotes long-term memory into the public mainline as a built-in capability.
The public repository now provides persistent memory namespaces and records with local SQLite storage,
including add/list/query/delete workflows through CLI.

WeiClaw-Core no longer decides whether long-term memory exists at all. It remains responsible for
higher-layer enhancements such as ownership-bound identity mapping, cross-device sync, and private
memory control-plane extensions.
