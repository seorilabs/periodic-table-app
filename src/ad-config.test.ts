import { describe, expect, it } from "vitest";

import { resolveAdGroupId } from "./ad-config";

describe("광고 그룹 설정", () => {
  it("개발 환경에서만 기본 테스트 ID를 사용한다", () => {
    expect(resolveAdGroupId(undefined, false)).toBe(
      "ait-ad-test-interstitial-id",
    );
  });

  it.each([
    undefined,
    "",
    "  ",
    "ait-ad-test-interstitial-id",
    "ait.dev.example",
  ])("운영 환경의 누락되거나 테스트용인 ID를 거절한다: %s", (value) => {
    expect(() => resolveAdGroupId(value, true)).toThrow("VITE_AIT_AD_GROUP_ID");
  });

  it("입력한 운영 ID를 공백 없이 사용한다", () => {
    expect(resolveAdGroupId(" ait.v2.live.d443768a005940c4 ", true)).toBe(
      "ait.v2.live.d443768a005940c4",
    );
  });
});
