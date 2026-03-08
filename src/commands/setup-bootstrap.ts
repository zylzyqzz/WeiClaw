import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { formatCliCommand } from "../cli/command-format.js";
import { formatWeiClawInstallerLogo } from "../cli/banner.js";
import { createConfigIO, type OpenClawConfig, writeConfigFile } from "../config/config.js";
import { formatConfigPath } from "../config/logging.js";
import { resolveSessionTranscriptsDir } from "../config/sessions.js";
import { resolveOpenClawPackageRoot } from "../infra/openclaw-root.js";
import { buildNpmResolutionInstallFields, recordPluginInstall } from "../plugins/installs.js";
import { installPluginFromNpmSpec } from "../plugins/install.js";
import { enablePluginInConfig } from "../plugins/enable.js";
import type { RuntimeEnv } from "../runtime.js";
import { defaultRuntime } from "../runtime.js";
import { runTui } from "../tui/tui.js";
import { resolveUserPath, shortenHomePath } from "../utils.js";
import { createClackPrompter } from "../wizard/clack-prompter.js";
import type { WizardPrompter } from "../wizard/prompts.js";
import { WizardCancelledError } from "../wizard/prompts.js";
import { DEFAULT_AGENT_WORKSPACE_DIR, ensureAgentWorkspace } from "../agents/workspace.js";
import { probeGatewayReachable } from "./onboard-helpers.js";
import {
  applyKimiCodeConfig,
  applyMoonshotConfig,
  applyQianfanConfig,
  applyQianfanProviderConfig,
  applyMoonshotProviderConfig,
  applyKimiCodeProviderConfig,
  setKimiCodingApiKey,
  setMoonshotApiKey,
  setQianfanApiKey,
} from "./onboard-auth.js";

type BootstrapModelChoice = "qianfan" | "kimi-coding" | "moonshot" | "custom";
type BootstrapChannelChoice = "telegram" | "feishu";

type SetupBootstrapOptions = {
  workspace?: string;
  skipTui?: boolean;
};

type BootstrapDeps = {
  createPrompter: () => WizardPrompter;
  installPluginFromNpmSpec: typeof installPluginFromNpmSpec;
  enablePluginInConfig: typeof enablePluginInConfig;
  recordPluginInstall: typeof recordPluginInstall;
  buildNpmResolutionInstallFields: typeof buildNpmResolutionInstallFields;
  writeConfigFile: typeof writeConfigFile;
  runTui: typeof runTui;
  probeGatewayReachable: typeof probeGatewayReachable;
  resolveOpenClawPackageRoot: typeof resolveOpenClawPackageRoot;
  spawn: typeof spawn;
  sleep: (ms: number) => Promise<void>;
};

const DEFAULT_GATEWAY_PORT = 19789;
const FEISHU_PLUGIN_SPEC = "@openclaw/feishu";

const MODEL_OPTIONS: Array<{
  value: BootstrapModelChoice;
  label: string;
  hint: string;
}> = [
  {
    value: "qianfan",
    label: "qianfan/deepseek-v3.2",
    hint: "推荐 / Recommended",
  },
  {
    value: "kimi-coding",
    label: "kimi-coding/k2p5",
    hint: "代码 / Coding",
  },
  {
    value: "moonshot",
    label: "moonshot/kimi-k2.5",
    hint: "推理 / Reasoning",
  },
  {
    value: "custom",
    label: "Custom",
    hint: "自定义 / Advanced",
  },
];

const CHANNEL_OPTIONS: Array<{
  value: BootstrapChannelChoice;
  label: string;
  hint: string;
}> = [
  {
    value: "telegram",
    label: "Telegram",
    hint: "更轻 / Lighter",
  },
  {
    value: "feishu",
    label: "Feishu",
    hint: "按需插件 / Optional plugin",
  },
];

function randomToken(): string {
  return randomBytes(24).toString("hex");
}

function printBootstrapLogo() {
  if (!process.stdout.isTTY) {
    return;
  }
  process.stdout.write(`\n${formatWeiClawInstallerLogo()}\n\n`);
}

function applyBootstrapBaseConfig(cfg: OpenClawConfig, workspace: string, gatewayToken: string) {
  return {
    ...cfg,
    agents: {
      ...cfg.agents,
      defaults: {
        ...cfg.agents?.defaults,
        workspace,
      },
    },
    gateway: {
      ...cfg.gateway,
      mode: "local",
      port: DEFAULT_GATEWAY_PORT,
      bind: "loopback",
      auth: {
        ...cfg.gateway?.auth,
        mode: "token",
        token: gatewayToken,
      },
      controlUi: {
        ...cfg.gateway?.controlUi,
        enabled: false,
      },
    },
    browser: {
      ...cfg.browser,
      enabled: false,
    },
  } satisfies OpenClawConfig;
}

async function promptModelApiKey(params: {
  prompter: WizardPrompter;
  label: string;
  envVar: string;
}): Promise<string | undefined> {
  const value = String(
    await params.prompter.text({
      message: `${params.label} API Key / API Key`,
      initialValue: process.env[params.envVar]?.trim() || "",
      placeholder: `${params.envVar} (留空则走环境变量 / blank = use env)`,
    }),
  ).trim();
  return value || process.env[params.envVar]?.trim() || undefined;
}

async function applyModelPreset(params: {
  cfg: OpenClawConfig;
  model: BootstrapModelChoice;
  prompter: WizardPrompter;
}): Promise<OpenClawConfig> {
  let next = params.cfg;
  if (params.model === "qianfan") {
    next = applyQianfanConfig(next);
    const apiKey = await promptModelApiKey({
      prompter: params.prompter,
      label: "Qianfan",
      envVar: "QIANFAN_API_KEY",
    });
    if (apiKey) {
      setQianfanApiKey(apiKey);
      next = applyQianfanProviderConfig(next);
    }
    return next;
  }

  if (params.model === "kimi-coding") {
    next = applyKimiCodeConfig(next);
    const apiKey = await promptModelApiKey({
      prompter: params.prompter,
      label: "Kimi Coding",
      envVar: "KIMI_API_KEY",
    });
    if (apiKey) {
      await setKimiCodingApiKey(apiKey);
      next = applyKimiCodeProviderConfig(next);
    }
    return next;
  }

  if (params.model === "moonshot") {
    next = applyMoonshotConfig(next);
    const apiKey = await promptModelApiKey({
      prompter: params.prompter,
      label: "Moonshot",
      envVar: "MOONSHOT_API_KEY",
    });
    if (apiKey) {
      await setMoonshotApiKey(apiKey);
      next = applyMoonshotProviderConfig(next);
    }
    return next;
  }

  const baseUrl = String(
    await params.prompter.text({
      message: "自定义 Base URL / Custom base URL",
      placeholder: "https://api.example.com/v1",
      validate: (value) => (value.trim() ? undefined : "必填 / Required"),
    }),
  ).trim();
  const modelId = String(
    await params.prompter.text({
      message: "自定义模型 / Custom model",
      placeholder: "provider/model",
      validate: (value) => (value.trim() ? undefined : "必填 / Required"),
    }),
  ).trim();
  const apiKey = String(
    await params.prompter.text({
      message: "自定义 API Key / Custom API Key",
      placeholder: "可留空 / Optional",
    }),
  ).trim();
  const [providerIdRaw, ...rest] = modelId.split("/");
  const providerId = providerIdRaw?.trim() || "custom";
  const remoteModelId = rest.join("/").trim() || modelId;
  return {
    ...next,
    agents: {
      ...next.agents,
      defaults: {
        ...next.agents?.defaults,
        model: { primary: `${providerId}/${remoteModelId}` },
        models: {
          ...next.agents?.defaults?.models,
          [`${providerId}/${remoteModelId}`]: {
            alias: next.agents?.defaults?.models?.[`${providerId}/${remoteModelId}`]?.alias ?? "Custom",
          },
        },
      },
    },
    models: {
      ...next.models,
      providers: {
        ...next.models?.providers,
        [providerId]: {
          ...(next.models?.providers?.[providerId] ?? {}),
          api: "openai-completions",
          baseUrl,
          ...(apiKey ? { apiKey } : {}),
          models: [
            {
              id: remoteModelId,
              name: remoteModelId,
              reasoning: false,
              input: ["text"],
              cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
              contextWindow: 128000,
              maxTokens: 8192,
            },
          ],
        },
      },
    },
  };
}

function applyTelegramConfig(cfg: OpenClawConfig, botToken: string): OpenClawConfig {
  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      telegram: {
        ...cfg.channels?.telegram,
        enabled: true,
        botToken,
        dmPolicy: "open",
        allowFrom: ["*"],
      },
      ...(cfg.channels?.feishu
        ? {
            feishu: {
              ...cfg.channels.feishu,
              enabled: false,
            },
          }
        : {}),
    },
  };
}

function applyFeishuConfig(params: {
  cfg: OpenClawConfig;
  appId: string;
  appSecret: string;
}): OpenClawConfig {
  return {
    ...params.cfg,
    channels: {
      ...params.cfg.channels,
      feishu: {
        ...params.cfg.channels?.feishu,
        enabled: true,
        appId: params.appId,
        appSecret: params.appSecret,
        connectionMode: "websocket",
        dmPolicy: "open",
        allowFrom: ["*"],
      },
      ...(params.cfg.channels?.telegram
        ? {
            telegram: {
              ...params.cfg.channels.telegram,
              enabled: false,
            },
          }
        : {}),
    },
  };
}

async function ensureFeishuPlugin(params: {
  cfg: OpenClawConfig;
  deps: BootstrapDeps;
  runtime: RuntimeEnv;
}): Promise<OpenClawConfig> {
  const result = await params.deps.installPluginFromNpmSpec({
    spec: FEISHU_PLUGIN_SPEC,
    logger: {
      info: (message) => params.runtime.log(message),
      warn: (message) => params.runtime.log(message),
    },
  });

  if (!result.ok) {
    throw new Error(`Feishu plugin install failed: ${result.error}`);
  }

  let next = params.deps.enablePluginInConfig(params.cfg, result.pluginId).config;
  next = params.deps.recordPluginInstall(next, {
    pluginId: result.pluginId,
    source: "npm",
    spec: FEISHU_PLUGIN_SPEC,
    installPath: result.targetDir,
    version: result.version,
    ...params.deps.buildNpmResolutionInstallFields(result.npmResolution),
  });
  return next;
}

async function maybeLaunchTui(params: {
  cfg: OpenClawConfig;
  gatewayToken: string;
  runtime: RuntimeEnv;
  deps: BootstrapDeps;
}): Promise<boolean> {
  const wsUrl = `ws://127.0.0.1:${DEFAULT_GATEWAY_PORT}`;
  const probe = await params.deps.probeGatewayReachable({
    url: wsUrl,
    token: params.gatewayToken,
  });

  if (!probe.ok) {
    const root = await params.deps.resolveOpenClawPackageRoot({
      cwd: process.cwd(),
      argv1: process.argv[1],
      moduleUrl: import.meta.url,
    });
    if (!root) {
      params.runtime.log("未找到启动入口 / Could not resolve gateway entry.");
      return false;
    }
    const wrapper = path.join(root, "openclaw.mjs");
    if (!wrapper) {
      params.runtime.log("未找到启动入口 / Could not resolve gateway entry.");
      return false;
    }
    const child: ReturnType<typeof spawn> = params.deps.spawn(
      process.execPath,
      [wrapper, "gateway", "--bind", "loopback", "--port", String(DEFAULT_GATEWAY_PORT), "--allow-unconfigured"],
      {
        cwd: root,
        stdio: "ignore",
        detached: true,
      },
    );
    child.unref();
    await params.deps.sleep(2500);
  }

  const followupProbe = await params.deps.probeGatewayReachable({
    url: wsUrl,
    token: params.gatewayToken,
  });
  if (!followupProbe.ok) {
    params.runtime.log("网关未就绪，跳过 TUI / Gateway not ready, skipping TUI.");
    return false;
  }

  await params.deps.runTui({
    url: wsUrl,
    token: params.gatewayToken,
    deliver: false,
  });
  return true;
}

export async function runSetupBootstrap(
  opts: SetupBootstrapOptions = {},
  runtime: RuntimeEnv = defaultRuntime,
  deps?: Partial<BootstrapDeps>,
) {
  const resolvedDeps: BootstrapDeps = {
    createPrompter: createClackPrompter,
    installPluginFromNpmSpec,
    enablePluginInConfig,
    recordPluginInstall,
    buildNpmResolutionInstallFields,
    writeConfigFile,
    runTui,
    probeGatewayReachable,
    resolveOpenClawPackageRoot,
    spawn,
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    ...deps,
  };

  const prompter = resolvedDeps.createPrompter();
  const io = createConfigIO();
  const workspace = resolveUserPath(opts.workspace?.trim() || DEFAULT_AGENT_WORKSPACE_DIR);
  const gatewayToken = randomToken();

  try {
    printBootstrapLogo();
    await prompter.intro("WeiClaw 极简安装 / Minimal setup");

    const modelChoice = await prompter.select<BootstrapModelChoice>({
      message: "请选择模型 / Select model",
      options: MODEL_OPTIONS,
      initialValue: "qianfan",
    });

    const channelChoice = await prompter.select<BootstrapChannelChoice>({
      message: "请选择通道 / Select channel",
      options: CHANNEL_OPTIONS,
      initialValue: "telegram",
    });

    let nextConfig: OpenClawConfig = applyBootstrapBaseConfig({}, workspace, gatewayToken);
    nextConfig = await applyModelPreset({
      cfg: nextConfig,
      model: modelChoice,
      prompter,
    });

    if (channelChoice === "telegram") {
      const botToken = String(
        await prompter.text({
          message: "请输入 Telegram Bot Token / Enter Telegram Bot Token",
          validate: (value) => (value.trim() ? undefined : "必填 / Required"),
        }),
      ).trim();
      nextConfig = applyTelegramConfig(nextConfig, botToken);
    } else {
      const appId = String(
        await prompter.text({
          message: "请输入 Feishu App ID / Enter Feishu App ID",
          validate: (value) => (value.trim() ? undefined : "必填 / Required"),
        }),
      ).trim();
      const appSecret = String(
        await prompter.text({
          message: "请输入 Feishu App Secret / Enter Feishu App Secret",
          validate: (value) => (value.trim() ? undefined : "必填 / Required"),
        }),
      ).trim();
      nextConfig = await ensureFeishuPlugin({
        cfg: nextConfig,
        deps: resolvedDeps,
        runtime,
      });
      nextConfig = applyFeishuConfig({ cfg: nextConfig, appId, appSecret });
    }

    await resolvedDeps.writeConfigFile(nextConfig);
    await ensureAgentWorkspace({
      dir: workspace,
      ensureBootstrapFiles: !nextConfig.agents?.defaults?.skipBootstrap,
    });
    await fs.mkdir(resolveSessionTranscriptsDir(), { recursive: true });

    const openTui =
      !opts.skipTui &&
      (await prompter.confirm({
        message: "是否立即打开 TUI？/ Open TUI now?",
        initialValue: true,
      }));

    if (openTui) {
      await prompter.note("正在打开 TUI / Opening TUI", "WeiClaw");
      const launched = await maybeLaunchTui({
        cfg: nextConfig,
        gatewayToken,
        runtime,
        deps: resolvedDeps,
      });
      if (launched) {
        return;
      }
    }

    await prompter.outro(
      [
        "安装完成 / Setup complete",
        `配置文件 / Config: ${formatConfigPath(io.configPath)}`,
        `工作区 / Workspace: ${shortenHomePath(workspace)}`,
        `启动 / Start: npm run start`,
        `状态 / Status: ${formatCliCommand("weiclaw status")}`,
        `终端 / TUI: ${formatCliCommand("weiclaw tui")}`,
        `高级配置 / Advanced: ${formatCliCommand("weiclaw configure")}`,
      ].join("\n"),
    );
  } catch (error) {
    if (error instanceof WizardCancelledError) {
      runtime.exit(1);
      return;
    }
    throw error;
  }
}

