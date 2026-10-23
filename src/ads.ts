import {
  loadFullScreenAd,
  showFullScreenAd,
} from "@apps-in-toss/web-framework";

import { resolveAdGroupId } from "./ad-config";

const AD_SHOW_TIMEOUT_MS = 5_000;

export interface ShowAdResult {
  shown: boolean;
  reason: "dismissed" | "failed" | "timeout" | "unsupported" | "not_loaded";
}

export function getAdGroupId(): string {
  return resolveAdGroupId(
    import.meta.env.VITE_AIT_AD_GROUP_ID,
    import.meta.env.PROD,
  );
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
  adGroupId: string;
  loaded: boolean;
  ready: Promise<boolean>;
  unload: () => void;
}

export function loadInterstitialAd(options: LoadAdOptions = {}): LoadAdHandle {
  let resolveReady!: (loaded: boolean) => void;
  const handle: LoadAdHandle = {
    adGroupId: options.adGroupId ?? getAdGroupId(),
    loaded: false,
    ready: new Promise<boolean>((resolve) => {
      resolveReady = resolve;
    }),
    unload: () => {
      resolveReady(false);
    },
  };

  if (!isAdSupported()) {
    resolveReady(false);
    options.onError?.(
      new Error("Full-screen ad is not supported in this environment."),
    );
    return handle;
  }

  let disposed = false;
  const unregister = loadFullScreenAd({
    options: { adGroupId: handle.adGroupId },
    onEvent: (event) => {
      if (!disposed && event.type === "loaded") {
        handle.loaded = true;
        resolveReady(true);
        options.onLoaded?.();
      }
    },
    onError: (error) => {
      if (disposed) return;
      handle.loaded = false;
      resolveReady(false);
      options.onError?.(error);
    },
  });
  handle.unload = () => {
    if (disposed) return;
    disposed = true;
    handle.loaded = false;
    resolveReady(false);
    unregister();
  };

  return handle;
}

export async function showInterstitialAd(options: {
  ad: LoadAdHandle;
  onShown?: () => void;
  onAdImpression?: (adGroupId: string) => void;
  onError?: (reason: ShowAdResult["reason"]) => void;
}): Promise<ShowAdResult> {
  const { ad } = options;
  const adGroupId = ad.adGroupId;

  if (!isAdSupported()) {
    options.onError?.("unsupported");
    return { shown: false, reason: "unsupported" };
  }

  const loaded = await new Promise<boolean>((resolve) => {
    const timeoutId = setTimeout(() => resolve(false), AD_SHOW_TIMEOUT_MS);
    void ad.ready.then((ready) => {
      clearTimeout(timeoutId);
      resolve(ready);
    });
  });
  if (!loaded || !ad.loaded) {
    return { shown: false, reason: "not_loaded" };
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
            clearTimeout(timeoutId);
            options.onShown?.();
            break;
          case "impression":
            clearTimeout(timeoutId);
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
