import {
  loadFullScreenAd,
  showFullScreenAd,
} from "@apps-in-toss/web-framework";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loadInterstitialAd, showInterstitialAd } from "./ads";

const adGroupId = "ait-ad-test-interstitial-id";

describe("퀴즈 전면광고", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(loadFullScreenAd.isSupported).mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(loadFullScreenAd.isSupported).mockReturnValue(false);
  });

  it("로드 완료를 기다린 뒤 같은 ID로 표시하고 닫힐 때 끝난다", async () => {
    const ad = loadInterstitialAd({ adGroupId });
    const onAdImpression = vi.fn();
    const result = showInterstitialAd({ ad, onAdImpression });
    expect(showFullScreenAd).not.toHaveBeenCalled();

    vi.mocked(loadFullScreenAd).mock.calls[0][0].onEvent({ type: "loaded" });
    await vi.advanceTimersByTimeAsync(0);
    expect(showFullScreenAd).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ options: { adGroupId } }),
    );
    const show = vi.mocked(showFullScreenAd).mock.calls[0][0];
    show.onEvent({ type: "impression" });
    expect(onAdImpression).toHaveBeenCalledExactlyOnceWith(adGroupId);
    show.onEvent({ type: "dismissed" });
    await expect(result).resolves.toEqual({ shown: true, reason: "dismissed" });
    ad.unload();
  });

  it("로드가 끝나지 않으면 5초 뒤 표시를 생략한다", async () => {
    const ad = loadInterstitialAd({ adGroupId });
    const result = showInterstitialAd({ ad });
    await vi.advanceTimersByTimeAsync(5_000);
    await expect(result).resolves.toEqual({
      shown: false,
      reason: "not_loaded",
    });
    expect(showFullScreenAd).not.toHaveBeenCalled();
    vi.mocked(loadFullScreenAd).mock.calls[0][0].onEvent({ type: "loaded" });
    await vi.advanceTimersByTimeAsync(0);
    expect(showFullScreenAd).not.toHaveBeenCalled();
    ad.unload();
  });

  it("로드 실패와 화면 이탈 시 표시하지 않는다", async () => {
    const ad = loadInterstitialAd({ adGroupId });
    const result = showInterstitialAd({ ad });
    ad.unload();
    await expect(result).resolves.toEqual({
      shown: false,
      reason: "not_loaded",
    });
    expect(showFullScreenAd).not.toHaveBeenCalled();

    const failed = loadInterstitialAd({ adGroupId });
    const failedResult = showInterstitialAd({ ad: failed });
    vi.mocked(loadFullScreenAd).mock.calls[1][0].onError(new Error("no fill"));
    await expect(failedResult).resolves.toEqual({
      shown: false,
      reason: "not_loaded",
    });
    failed.unload();
  });

  it("광고가 표시된 동안에는 5초가 지나도 완료하지 않는다", async () => {
    const ad = loadInterstitialAd({ adGroupId });
    vi.mocked(loadFullScreenAd).mock.calls[0][0].onEvent({ type: "loaded" });
    const completed = vi.fn();
    const result = showInterstitialAd({ ad }).then(completed);
    await vi.advanceTimersByTimeAsync(0);
    const show = vi.mocked(showFullScreenAd).mock.calls[0][0];
    show.onEvent({ type: "show" });
    await vi.advanceTimersByTimeAsync(10_000);
    expect(completed).not.toHaveBeenCalled();
    show.onEvent({ type: "dismissed" });
    await result;
    expect(completed).toHaveBeenCalledWith({
      shown: true,
      reason: "dismissed",
    });
    ad.unload();
  });

  it("닫힘 알림이 유실돼도 표시 후 2분 안에 대기를 끝낸다", async () => {
    const ad = loadInterstitialAd({ adGroupId });
    vi.mocked(loadFullScreenAd).mock.calls[0][0].onEvent({ type: "loaded" });
    const result = showInterstitialAd({ ad });
    await vi.advanceTimersByTimeAsync(0);
    const show = vi.mocked(showFullScreenAd).mock.calls[0][0];
    show.onEvent({ type: "show" });
    show.onEvent({ type: "impression" });
    await vi.advanceTimersByTimeAsync(120_000);
    await expect(result).resolves.toEqual({ shown: true, reason: "timeout" });
    ad.unload();
  });
});
