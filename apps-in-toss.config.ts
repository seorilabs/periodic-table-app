import { defineConfig } from "@apps-in-toss/web-framework/config";

// AppsInToss SDK 3.x 설정. v2의 granite.config.ts를 대체.
// v2에서 존재하던 brand.displayName, brand.icon, webViewProps.type, outdir, web.commands는
// v3 스키마에서 제거됐다. 디스플레이 이름과 아이콘은 콘솔 등록 메타데이터와
// index.html <title>에서 관리한다. partner/standalone 등 앱 타입은 콘솔 측 설정으로 이동.
export default defineConfig({
  appName: "periodic-table",
  brand: {
    primaryColor: "#1F8A70",
  },
  permissions: [],
  webBundleDir: "dist",
});
