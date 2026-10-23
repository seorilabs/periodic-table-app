import aitDevtools from "@apps-in-toss/devtools/unplugin";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

import { resolveAdGroupId } from "./src/ad-config";

export default defineConfig(({ mode, command }) => {
  if (command === "build" && mode === "production") {
    const env = loadEnv(mode, process.cwd(), "VITE_");
    resolveAdGroupId(env.VITE_AIT_AD_GROUP_ID, true);
  }
  return { plugins: [aitDevtools.vite(), react()] };
});
