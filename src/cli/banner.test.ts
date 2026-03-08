import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const loadConfigMock = vi.fn();

vi.mock("../config/config.js", () => ({
  loadConfig: loadConfigMock,
}));

let formatCliBannerLine: typeof import("./banner.js").formatCliBannerLine;
let formatWeiClawInstallerLogo: typeof import("./banner.js").formatWeiClawInstallerLogo;

beforeAll(async () => {
  ({ formatCliBannerLine, formatWeiClawInstallerLogo } = await import("./banner.js"));
});

beforeEach(() => {
  loadConfigMock.mockReset();
  loadConfigMock.mockReturnValue({});
});

describe("formatCliBannerLine", () => {
  it("hides tagline text when cli.banner.taglineMode is off", () => {
    loadConfigMock.mockReturnValue({
      cli: { banner: { taglineMode: "off" } },
    });

    const line = formatCliBannerLine("2026.3.3", {
      commit: "abc1234",
      richTty: false,
    });

    expect(line).toBe("[W] WeiClaw Private 2026.3.3 (abc1234)");
  });

  it("uses default tagline when cli.banner.taglineMode is default", () => {
    loadConfigMock.mockReturnValue({
      cli: { banner: { taglineMode: "default" } },
    });

    const line = formatCliBannerLine("2026.3.3", {
      commit: "abc1234",
      richTty: false,
    });

    expect(line).toBe("[W] WeiClaw Private 2026.3.3 (abc1234) - Telegram-first execution on WeiClaw.");
  });

  it("prefers explicit tagline mode over config", () => {
    loadConfigMock.mockReturnValue({
      cli: { banner: { taglineMode: "off" } },
    });

    const line = formatCliBannerLine("2026.3.3", {
      commit: "abc1234",
      richTty: false,
      mode: "default",
    });

    expect(line).toBe("[W] WeiClaw Private 2026.3.3 (abc1234) - Telegram-first execution on WeiClaw.");
  });
});

describe("formatWeiClawInstallerLogo", () => {
  it("renders a short plain installer logo", () => {
    const logo = formatWeiClawInstallerLogo({ richTty: false });
    expect(logo).toContain("WeiClaw");
    expect(logo).toContain("极简私有助手 / Minimal private agent");
  });
});

