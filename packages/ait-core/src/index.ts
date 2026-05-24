import { Analytics, Storage, share } from "@apps-in-toss/web-framework";

export type AnalyticsValue = string | number | boolean | null | undefined;
export type AnalyticsParams = Record<string, AnalyticsValue>;

export type ShareMessageMethod =
  | "apps-in-toss"
  | "web-share"
  | "clipboard"
  | "unavailable";

export interface ShareMessageResult {
  ok: boolean;
  method: ShareMessageMethod;
}

type LogPayload = AnalyticsParams & {
  log_name: string;
};

export function trackClick(
  eventName: string,
  params: AnalyticsParams = {},
): void {
  logSafely(() =>
    Analytics.click({
      ...params,
      log_name: eventName,
    } satisfies LogPayload),
  );
}

export function trackImpression(
  eventName: string,
  params: AnalyticsParams = {},
): void {
  logSafely(() =>
    Analytics.impression({
      ...params,
      log_name: eventName,
    } satisfies LogPayload),
  );
}

export async function shareMessage(
  message: string,
  fallbackTitle = "Apps in Toss",
): Promise<ShareMessageResult> {
  try {
    await share({ message });
    return { ok: true, method: "apps-in-toss" };
  } catch {
    return shareWithBrowser(message, fallbackTitle);
  }
}

export async function getStorageItem(key: string): Promise<string | null> {
  try {
    return await Storage.getItem(key);
  } catch {
    return getLocalStorageItem(key);
  }
}

export async function setStorageItem(
  key: string,
  value: string,
): Promise<void> {
  try {
    await Storage.setItem(key, value);
    return;
  } catch {
    setLocalStorageItem(key, value);
  }
}

export async function removeStorageItem(key: string): Promise<void> {
  try {
    await Storage.removeItem(key);
    return;
  } catch {
    removeLocalStorageItem(key);
  }
}

export function isAppsInTossRuntime(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const runtimeWindow = window as Window & {
    AppsInToss?: unknown;
    ReactNativeWebView?: unknown;
    webkit?: { messageHandlers?: Record<string, unknown> };
  };

  return (
    runtimeWindow.AppsInToss != null ||
    runtimeWindow.ReactNativeWebView != null ||
    runtimeWindow.webkit?.messageHandlers?.appsInToss != null ||
    /Toss|AppsInToss|Granite/i.test(navigator.userAgent)
  );
}

function logSafely(log: () => Promise<void> | undefined): void {
  try {
    void log()?.catch(() => undefined);
  } catch {
    // Runtime analytics must never interrupt a user flow.
  }
}

async function shareWithBrowser(
  message: string,
  fallbackTitle: string,
): Promise<ShareMessageResult> {
  if (typeof navigator === "undefined") {
    return { ok: false, method: "unavailable" };
  }

  const shareNavigator = navigator as Navigator & {
    share?: (data: { text?: string; title?: string }) => Promise<void>;
  };

  if (typeof shareNavigator.share === "function") {
    try {
      await shareNavigator.share({ text: message, title: fallbackTitle });
      return { ok: true, method: "web-share" };
    } catch {
      // Fall through to clipboard.
    }
  }

  if (navigator.clipboard != null) {
    try {
      await navigator.clipboard.writeText(message);
      return { ok: true, method: "clipboard" };
    } catch {
      // Fall through to unavailable.
    }
  }

  return { ok: false, method: "unavailable" };
}

function getLocalStorageItem(key: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setLocalStorageItem(key: string, value: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage fallback is best-effort only.
  }
}

function removeLocalStorageItem(key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Storage fallback is best-effort only.
  }
}
