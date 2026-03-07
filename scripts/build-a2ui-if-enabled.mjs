import { bundleA2ui } from "./build-a2ui.mjs";

function isEnabled(value) {
  if (typeof value !== "string") {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

export function shouldBuildA2ui(env = process.env) {
  return isEnabled(env.WEICLAW_BUILD_UI) || isEnabled(env.OPENCLAW_BUILD_UI);
}

if (shouldBuildA2ui()) {
  bundleA2ui().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
} else {
  console.log("Skipping optional A2UI bundle for WeiClaw default build. Set WEICLAW_BUILD_UI=1 to enable.");
}
