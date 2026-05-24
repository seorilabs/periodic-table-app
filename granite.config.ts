import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "periodic-table",
  brand: {
    displayName: "원소 주기율표",
    primaryColor: "#1F8A70",
    icon: "https://static.toss.im/appsintoss/38345/045e816d-d16d-4ca8-839f-ebb99e97eb09.png",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  webViewProps: {
    type: "partner",
  },
  permissions: [],
  outdir: "dist",
});
