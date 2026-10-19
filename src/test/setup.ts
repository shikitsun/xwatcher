import { vi } from "vitest";
import { FakeMediaSource } from "./fake-mse";

// SyncVideoStream checks MediaSource.isTypeSupported on import
// Stub before it
vi.stubGlobal("MediaSource", FakeMediaSource);
vi.stubGlobal("window", globalThis);

URL.createObjectURL = () => "blob:sync-video-test";
URL.revokeObjectURL = () => {};
