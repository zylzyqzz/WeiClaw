import type { Command } from "commander";
import { resolveCoreBridgeStatus } from "../core-bridge/status.js";
import { defaultRuntime } from "../runtime.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { formatHelpExamples } from "./help-format.js";

type CoreBridgeCommandOptions = {
  json?: boolean;
};

function printCoreBridgeStatus(opts: CoreBridgeCommandOptions): void {
  const status = resolveCoreBridgeStatus();
  if (opts.json) {
    defaultRuntime.log(JSON.stringify(status, null, 2));
    return;
  }
  defaultRuntime.log(`enabled=${status.enabled}`);
  defaultRuntime.log(`mode=${status.mode}`);
  defaultRuntime.log(`endpoint=${status.endpoint || "none"}`);
  defaultRuntime.log(`timeoutMs=${status.timeoutMs}`);
  defaultRuntime.log(`ready=${status.ready}`);
  defaultRuntime.log(`issues=${status.issues.length === 0 ? "none" : status.issues.join("; ")}`);
}

export function registerCoreBridgeCli(program: Command): void {
  const coreBridge = program
    .command("core-bridge")
    .description("Inspect WeiClaw v2.0.5 Core Bridge extension slot")
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples([
          ["openclaw core-bridge status", "Show bridge runtime status."],
          ["openclaw core-bridge doctor --json", "Run bridge doctor checks in JSON output."],
        ])}\n\n${theme.muted("Docs:")} ${formatDocsLink(
          "/channels/core-bridge",
          "docs.openclaw.ai/channels/core-bridge",
        )}\n`,
    );

  coreBridge
    .command("status")
    .description("Show core-bridge status")
    .option("--json", "Print JSON", false)
    .action(async (opts: CoreBridgeCommandOptions) => {
      printCoreBridgeStatus(opts);
    });

  coreBridge
    .command("doctor")
    .description("Run core-bridge readiness checks")
    .option("--json", "Print JSON", false)
    .action(async (opts: CoreBridgeCommandOptions) => {
      const status = resolveCoreBridgeStatus();
      const report = {
        status: status.ready ? "ok" : "warn",
        bridge: status,
        checks: [
          {
            check: "bridge-enabled",
            ok: status.enabled,
            detail: status.enabled ? "enabled" : "disabled",
          },
          {
            check: "bridge-endpoint",
            ok: status.mode !== "http" || status.endpoint.length > 0,
            detail:
              status.mode === "http"
                ? status.endpoint || "missing WEICLAW_CORE_BRIDGE_ENDPOINT"
                : "not-required-in-noop-mode",
          },
        ],
      };
      if (opts.json) {
        defaultRuntime.log(JSON.stringify(report, null, 2));
        return;
      }
      defaultRuntime.log(`status=${report.status}`);
      printCoreBridgeStatus({});
    });
}
