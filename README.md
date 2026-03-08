# WeiClaw 极简私有助手

```
 __     __
 \ \ /\ / /
  \ V  V /
   \_/\_/
   WeiClaw
```

**Minimal private agent** - 基于 OpenClaw 改造的极简私有 AI 助手。

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
4. 引导完成后可选择是否立即打开 TUI

## 引导安装流程

首次安装后会进入引导流程，按提示完成配置：

```
WeiClaw
Minimal private agent

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

## 模型与通道

### 模型配置

推荐模型：

| 模型 | 用途 |
|------|------|
| `qianfan/deepseek-v3.2` | 综合balanced |
| `kimi-coding/k2p5` | 代码 |
| `moonshot/kimi-k2.5` | 推理 |

自定义模型：选择 `Custom`，填入 Base URL + Model ID + API Key。

### 通道配置

- **Telegram**：只需 Bot Token，最轻量
- **Feishu/Lark**：需要 App ID + App Secret，引导流程中可选

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

## 当前限制

- **jsDelivr**：仅作为脚本入口的备用源，不可直接镜像 runtime .tgz 包
- **npm fallback**：尚未发布 `@weiclaw/runtime` 到 npm，暂不作为默认回退链
- **国内分发**：依赖 GitHub Release + ghproxy.net 第三方公共服务

## Roadmap

- [ ] 发布 @weiclaw/runtime 到 npm（更稳定的回退源）
- [ ] 更稳定的国内分发源
- [ ] Feishu/Lark 通道完善
- [ ] 更多模型接入

## License / Attribution

WeiClaw 基于 [OpenClaw](https://github.com/stealth/Claude-Code) 改造，保留上游开源协议与归属声明。

保留文件：
- `LICENSE`
- `NOTICE.md`
- 上游归属声明
