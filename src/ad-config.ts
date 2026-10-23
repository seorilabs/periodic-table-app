export function resolveAdGroupId(value: unknown, production: boolean): string {
  const id = typeof value === "string" ? value.trim() : "";
  if (
    production &&
    (!id || id.startsWith("ait-ad-test-") || id.startsWith("ait.dev."))
  ) {
    throw new Error(
      "운영 빌드에는 실제 VITE_AIT_AD_GROUP_ID를 설정해야 합니다.",
    );
  }
  return id || "ait-ad-test-interstitial-id";
}
