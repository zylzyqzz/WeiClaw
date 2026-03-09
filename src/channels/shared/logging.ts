import type { RuntimeEnv } from "../../runtime.js";

export function logChinaChannelInfo(
  runtime: Pick<RuntimeEnv, "log">,
  channel: string,
  message: string,
) {
  runtime.log(`[${channel}] ${message}`);
}

export function logChinaChannelError(
  runtime: Pick<RuntimeEnv, "error">,
  channel: string,
  message: string,
) {
  runtime.error(`[${channel}] ${message}`);
}
