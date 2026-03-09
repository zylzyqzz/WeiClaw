import { loadChinaChannelConfig } from "../../channels/config/china-channel-config.js";
import {
  formatChinaChannelStatusLines,
  runChinaChannelDoctor,
  runChinaChannelRouteTest,
} from "../../channels/doctor/china-channel-checks.js";
import type { RuntimeEnv } from "../../runtime.js";

export async function channelsChinaStatusCommand(runtime: RuntimeEnv): Promise<void> {
  for (const line of formatChinaChannelStatusLines(loadChinaChannelConfig())) {
    runtime.log(line);
  }
}

export async function channelsChinaDoctorCommand(runtime: RuntimeEnv): Promise<void> {
  const result = runChinaChannelDoctor(runtime, loadChinaChannelConfig());
  runtime.log(JSON.stringify(result, null, 2));
}

export async function channelsChinaTestCommand(runtime: RuntimeEnv): Promise<void> {
  const result = await runChinaChannelRouteTest(runtime, loadChinaChannelConfig());
  runtime.log(JSON.stringify(result, null, 2));
}
