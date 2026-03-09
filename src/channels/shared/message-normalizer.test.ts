import { describe, expect, it } from "vitest";
import { normalizeChannelTextMessage } from "./message-normalizer.js";

describe("normalizeChannelTextMessage", () => {
  it("trims identifiers and text into a shared message shape", () => {
    const message = normalizeChannelTextMessage({
      channel: "wecom",
      senderId: " user-1 ",
      conversationId: " room-1 ",
      text: " hello ",
      timestamp: "2026-03-09T00:00:00.000Z",
      raw: { source: "test" },
    });

    expect(message).toEqual({
      channel: "wecom",
      senderId: "user-1",
      conversationId: "room-1",
      text: "hello",
      timestamp: "2026-03-09T00:00:00.000Z",
      raw: { source: "test" },
    });
  });
});
