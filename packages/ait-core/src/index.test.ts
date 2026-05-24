import { Analytics, Storage, share } from "@apps-in-toss/web-framework";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getStorageItem,
  isAppsInTossRuntime,
  removeStorageItem,
  setStorageItem,
  shareMessage,
  trackClick,
  trackImpression,
} from "./index";

vi.mock("@apps-in-toss/web-framework", () => ({
  Analytics: {
    click: vi.fn().mockResolvedValue(undefined),
    impression: vi.fn().mockResolvedValue(undefined),
  },
  Storage: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
  share: vi.fn().mockResolvedValue(undefined),
}));

describe("@seorilabs/ait-core", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    delete (window as Window & { AppsInToss?: unknown }).AppsInToss;
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("tracks click analytics with log_name and params", () => {
    trackClick("test_click", { source: "unit" });

    expect(Analytics.click).toHaveBeenCalledWith({
      log_name: "test_click",
      source: "unit",
    });
  });

  it("tracks impression analytics with log_name and params", () => {
    trackImpression("test_view", { id: 1 });

    expect(Analytics.impression).toHaveBeenCalledWith({
      log_name: "test_view",
      id: 1,
    });
  });

  it("does not throw when analytics rejects", () => {
    vi.mocked(Analytics.click).mockRejectedValueOnce(new Error("network"));

    expect(() => trackClick("safe_click")).not.toThrow();
  });

  it("shares through AppsInToss first", async () => {
    await expect(shareMessage("hello")).resolves.toEqual({
      ok: true,
      method: "apps-in-toss",
    });
    expect(share).toHaveBeenCalledWith({ message: "hello" });
  });

  it("falls back to browser share when AppsInToss share fails", async () => {
    const browserShare = vi.fn().mockResolvedValue(undefined);
    vi.mocked(share).mockRejectedValueOnce(new Error("outside runtime"));
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: browserShare,
    });

    await expect(shareMessage("hello", "Title")).resolves.toEqual({
      ok: true,
      method: "web-share",
    });
    expect(browserShare).toHaveBeenCalledWith({
      text: "hello",
      title: "Title",
    });
  });

  it("falls back to localStorage when Storage.getItem fails", async () => {
    vi.mocked(Storage.getItem).mockRejectedValueOnce(new Error("bridge"));
    window.localStorage.setItem("draft", "value");

    await expect(getStorageItem("draft")).resolves.toBe("value");
  });

  it("falls back to localStorage for writes and removals", async () => {
    vi.mocked(Storage.setItem).mockRejectedValueOnce(new Error("bridge"));
    vi.mocked(Storage.removeItem).mockRejectedValueOnce(new Error("bridge"));

    await setStorageItem("draft", "value");
    expect(window.localStorage.getItem("draft")).toBe("value");

    await removeStorageItem("draft");
    expect(window.localStorage.getItem("draft")).toBeNull();
  });

  it("detects the AppsInToss runtime from bridge globals", () => {
    expect(isAppsInTossRuntime()).toBe(false);

    (window as Window & { AppsInToss?: unknown }).AppsInToss = {};

    expect(isAppsInTossRuntime()).toBe(true);
  });
});
