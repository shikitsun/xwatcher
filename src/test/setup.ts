import { vi } from "vitest";
import { FakeMediaSource } from "./fake-mse";

// SyncVideoStream checks MediaSource on construction;
// stub it before any module under test is imported.
vi.stubGlobal("MediaSource", FakeMediaSource);
// `mockIPC` from @tauri-apps/api/mocks reads `window`, including in the
// node-based engine tests.
vi.stubGlobal("window", globalThis);

URL.createObjectURL = () => "blob:sync-video-test";
URL.revokeObjectURL = () => {};

// jsdom gaps used by the player UI and the modal. Guarded so the node-based
// engine tests keep running without a DOM.
if (typeof window !== "undefined") {
  if (typeof HTMLDialogElement !== "undefined") {
    HTMLDialogElement.prototype.show ??= function show(
      this: HTMLDialogElement,
    ) {
      this.open = true;
    };
    HTMLDialogElement.prototype.showModal ??= function showModal(
      this: HTMLDialogElement,
    ) {
      this.open = true;
    };
    HTMLDialogElement.prototype.close ??= function close(
      this: HTMLDialogElement,
    ) {
      this.open = false;
      this.dispatchEvent(new Event("close"));
    };
  }

  if (typeof HTMLMediaElement !== "undefined") {
    HTMLMediaElement.prototype.load = () => {};
    HTMLMediaElement.prototype.play = () => Promise.resolve();
    HTMLMediaElement.prototype.pause = () => {};
  }

  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
  }

  if (!("ResizeObserver" in window)) {
    class FakeResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  }

  if (!("IntersectionObserver" in window)) {
    class FakeIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  }
}
