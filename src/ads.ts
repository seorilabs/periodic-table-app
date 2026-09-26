import {
  loadFullScreenAd,
  showFullScreenAd,
} from "@apps-in-toss/web-framework";

const DEFAULT_AD_GROUP_ID = "ait-ad-test-interstitial-id";
const AD_SHOW_TIMEOUT_MS = 5_000;

export interface ShowAdResult {
  shown: boolean;
  reason: "shown" | "dismissed" | "failed" | "timeout" | "unsupported";
}

export function getAdGroupId(): string {
  const fromEnv = import.meta.env.VITE_AIT_AD_GROUP_ID;
  if (typeof fromEnv === "string" && fromEnv.trim().length > 0) {
    return fromEnv;
  }
  return DEFAULT_AD_GROUP_ID;
}

export function isAdSupported(): boolean {
  const supported = loadFullScreenAd.isSupported?.();
  return supported === true;
}

export interface LoadAdOptions {
  adGroupId?: string;
  onLoaded?: () => void;
  onError?: (error: unknown) => void;
}

export interface LoadAdHandle {
  loaded: boolean;
  unload: () => void;
}

export function loadInterstitialAd(options: LoadAdOptions = {}): LoadAdHandle {
  const handle: LoadAdHandle = {
    loaded: false,
    unload: () => {},
  };

  if (!isAdSupported()) {
    options.onError?.(new Error("Full-screen ad is not supported in this environment."));
    return handle;
  }

  handle.unload = loadFullScreenAd({
    options: { adGroupId: options.adGroupId ?? getAdGroupId() },
    onEvent: (event) => {
      if (event.type === "loaded") {
        handle.loaded = true;
        options.onLoaded?.();
      }
    },
    onError: (error) => {
      handle.loaded = false;
      options.onError?.(error);
    },
  });

  return handle;
}

export function showInterstitialAd(options: {
  adGroupId?: string;
  onShown?: () => void;
  onAdImpression?: (adGroupId: string) => void;
  onError?: (reason: ShowAdResult["reason"]) => void;
}): Promise<ShowAdResult> {
  const adGroupId = options.adGroupId ?? getAdGroupId();

  if (!isAdSupported()) {
    options.onError?.("unsupported");
    return Promise.resolve({ shown: false, reason: "unsupported" });
  }

  return new Promise<ShowAdResult>((resolve) => {
    let settled = false;
    const settle = (result: ShowAdResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve(result);
    };

    const timeoutId = setTimeout(() => {
      settle({ shown: false, reason: "timeout" });
    }, AD_SHOW_TIMEOUT_MS);

    showFullScreenAd({
      options: { adGroupId },
      onEvent: (event) => {
        switch (event.type) {
          case "show":
            options.onShown?.();
            break;
          case "impression":
            options.onAdImpression?.(adGroupId);
            break;
          case "dismissed":
            settle({ shown: true, reason: "dismissed" });
            break;
          case "failedToShow":
            settle({ shown: false, reason: "failed" });
            break;
        }
      },
      onError: () => {
        settle({ shown: false, reason: "failed" });
      },
    });
  });
}
