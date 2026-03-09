import { describe, expect, it, vi } from "vitest";
import {
  collectChinaChannelStatuses,
  formatChinaChannelStatusLines,
  runChinaChannelDoctor,
  runChinaChannelRouteTest,
} from "./china-channel-checks.js";

const config = {
  wecom: {
    enabled: true,
    corpId: "corp-1",
    corpSecret: "secret-1",
    agentId: "agent-1",
    token: "token-1",
    encodingAESKey: "aes-1",
    webhookPath: "/channels/wecom/webhook",
  },
  feishu: {
    enabled: true,
    appId: "app-1",
    appSecret: "secret-2",
    verificationToken: "verify-1",
    encryptKey: "encrypt-1",
    webhookPath: "/channels/feishu/webhook",
  },
};

describe("china channel checks", () => {
  it("collects ready statuses for fully configured channels", () => {
    const statuses = collectChinaChannelStatuses(config);

    expect(statuses).toHaveLength(2);
    expect(statuses.map((status) => status.status)).toEqual(["ready", "ready"]);
  });

  it("formats status lines with enabled flag and webhook path", () => {
    const lines = formatChinaChannelStatusLines(config);

    expect(lines).toEqual([
      "wecom: ready enabled=true webhookPath=/channels/wecom/webhook",
      "feishu: ready enabled=true webhookPath=/channels/feishu/webhook",
    ]);
  });

  it("runs doctor and route self-checks with structured output", () => {
    const runtime = { log: vi.fn() };

    const doctor = runChinaChannelDoctor(runtime, config);
    const routeTest = runChinaChannelRouteTest(runtime, config);

    expect(doctor.version).toBe("v2.0.1");
    expect(doctor.statuses).toHaveLength(2);
    expect(routeTest.version).toBe("v2.0.1");
    expect(routeTest.routes).toEqual([
      { channel: "wecom", matched: true, statusCode: 200 },
      { channel: "feishu", matched: true, statusCode: 200 },
    ]);
  });
});
