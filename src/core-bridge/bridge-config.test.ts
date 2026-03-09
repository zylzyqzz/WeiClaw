import { describe, expect, it } from "vitest";
import { loadCoreBridgeConfig } from "./bridge-config.js";
import { resolveCoreBridgeStatus } from "./status.js";

describe("core bridge config", () => {
  it("loads disabled defaults", () => {
    const config = loadCoreBridgeConfig({});
    expect(config.enabled).toBe(false);
    expect(config.mode).toBe("noop");
    expect(config.endpoint).toBe("");
    expect(config.timeoutMs).toBe(1500);
  });

  it("loads http mode from env", () => {
    const config = loadCoreBridgeConfig({
      WEICLAW_CORE_BRIDGE_ENABLED: "true",
      WEICLAW_CORE_BRIDGE_MODE: "http",
      WEICLAW_CORE_BRIDGE_ENDPOINT: "http://127.0.0.1:18790/bridge",
      WEICLAW_CORE_BRIDGE_TIMEOUT_MS: "2500",
    });
    expect(config.enabled).toBe(true);
    expect(config.mode).toBe("http");
    expect(config.endpoint).toBe("http://127.0.0.1:18790/bridge");
    expect(config.timeoutMs).toBe(2500);
  });

  it("reports doctor issues for missing endpoint in http mode", () => {
    const status = resolveCoreBridgeStatus({
      WEICLAW_CORE_BRIDGE_ENABLED: "true",
      WEICLAW_CORE_BRIDGE_MODE: "http",
    });
    expect(status.ready).toBe(false);
    expect(status.issues).toContain("WEICLAW_CORE_BRIDGE_ENDPOINT is required when mode=http");
  });
});
