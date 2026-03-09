import { Command } from "commander";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

const runtime = {
  log: vi.fn(),
  error: vi.fn(),
  exit: vi.fn(),
};

vi.mock("../runtime.js", () => ({
  defaultRuntime: runtime,
}));

let registerCoreBridgeCli: typeof import("./core-bridge-cli.js").registerCoreBridgeCli;
const envBackup = { ...process.env };

beforeAll(async () => {
  ({ registerCoreBridgeCli } = await import("./core-bridge-cli.js"));
});

afterEach(() => {
  runtime.log.mockClear();
  runtime.error.mockClear();
  runtime.exit.mockClear();
  const currentKeys = Object.keys(process.env);
  for (const key of currentKeys) {
    if (!(key in envBackup)) {
      delete process.env[key];
    }
  }
  for (const [key, value] of Object.entries(envBackup)) {
    process.env[key] = value;
  }
});

describe("core-bridge CLI", () => {
  it("registers status and doctor commands", () => {
    const program = new Command();
    registerCoreBridgeCli(program);
    const bridge = program.commands.find((entry) => entry.name() === "core-bridge");
    const commandNames = bridge?.commands.map((entry) => entry.name()) ?? [];

    expect(commandNames).toContain("status");
    expect(commandNames).toContain("doctor");
  });

  it("prints status output in json mode", async () => {
    const program = new Command();
    registerCoreBridgeCli(program);

    await program.parseAsync(["core-bridge", "status", "--json"], { from: "user" });

    expect(runtime.log).toHaveBeenCalledTimes(1);
    const output = JSON.parse(String(runtime.log.mock.calls[0]?.[0] ?? "{}")) as {
      enabled: boolean;
      mode: string;
    };
    expect(output.enabled).toBe(false);
    expect(output.mode).toBe("noop");
  });

  it("reports doctor warning when http mode misses endpoint", async () => {
    process.env.WEICLAW_CORE_BRIDGE_ENABLED = "true";
    process.env.WEICLAW_CORE_BRIDGE_MODE = "http";
    delete process.env.WEICLAW_CORE_BRIDGE_ENDPOINT;

    const program = new Command();
    registerCoreBridgeCli(program);
    await program.parseAsync(["core-bridge", "doctor", "--json"], { from: "user" });

    const report = JSON.parse(String(runtime.log.mock.calls.at(-1)?.[0] ?? "{}")) as {
      status: string;
      bridge: { ready: boolean; issues: string[] };
    };
    expect(report.status).toBe("warn");
    expect(report.bridge.ready).toBe(false);
    expect(report.bridge.issues).toContain(
      "WEICLAW_CORE_BRIDGE_ENDPOINT is required when mode=http",
    );
  });
});
