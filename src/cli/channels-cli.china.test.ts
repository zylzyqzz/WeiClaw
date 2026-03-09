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

let registerChannelsCli: typeof import("./channels-cli.js").registerChannelsCli;

beforeAll(async () => {
  ({ registerChannelsCli } = await import("./channels-cli.js"));
});

describe("channels CLI china foundation commands", () => {
  afterEach(() => {
    runtime.log.mockClear();
    runtime.error.mockClear();
    runtime.exit.mockClear();
  });

  it("registers v2.0.1 China channel commands", () => {
    const program = new Command();
    registerChannelsCli(program);
    const channels = program.commands.find((entry) => entry.name() === "channels");
    const commandNames = channels?.commands.map((entry) => entry.name()) ?? [];

    expect(commandNames).toContain("china-status");
    expect(commandNames).toContain("china-doctor");
    expect(commandNames).toContain("china-test");
  });

  it("runs the v2.0.1 china-status command without exiting", async () => {
    const program = new Command();
    registerChannelsCli(program);

    await program.parseAsync(["channels", "china-status"], { from: "user" });

    expect(runtime.exit).not.toHaveBeenCalled();
    expect(runtime.log).toHaveBeenCalledWith(
      expect.stringContaining("wecom: disabled enabled=false webhookPath="),
    );
    expect(runtime.log).toHaveBeenCalledWith(
      expect.stringContaining("feishu: disabled enabled=false webhookPath="),
    );
  });
});
