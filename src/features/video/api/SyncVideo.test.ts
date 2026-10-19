import { afterEach, describe, expect, it, vi } from "vitest";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import type { Channel } from "@tauri-apps/api/core";
import { SyncVideoStream, type SyncVideoStreamConfig } from "./SyncVideo";
import {
  FakeMediaSource,
  lastSourceBuffer,
  resetFakeMediaSource,
} from "@/test/fake-mse";

interface IpcLogEntry {
  cmd: string;
  start?: number;
}

interface IpcMockOptions {
  duration?: number;
  entriesPerChunk?: number;
  delayMs?: number;
}

function encodeEntry(entry: { offset: number; duration: number }): ArrayBuffer {
  const json = new TextEncoder().encode(JSON.stringify(entry));
  const buffer = new ArrayBuffer(4 + json.byteLength);

  new DataView(buffer).setUint32(0, json.byteLength);
  new Uint8Array(buffer).set(json, 4);

  return buffer;
}

function tauriInternals() {
  return (
    window as unknown as {
      __TAURI_INTERNALS__: {
        runCallback: (id: number, data: unknown) => void;
      };
    }
  ).__TAURI_INTERNALS__;
}

/**
 * Mocks Tauri
 */
function installIpc(options: IpcMockOptions = {}) {
  const duration = options.duration ?? 300;
  const entries = options.entriesPerChunk ?? 12;
  const delay = options.delayMs ?? 0;
  const log: IpcLogEntry[] = [];
  let token = 0;

  mockIPC(async (cmd, args) => {
    if (cmd === "probe_video_duration") return duration;

    if (cmd === "clear_remux") {
      token++;
      log.push({ cmd });
      return;
    }

    if (cmd !== "create_remux") {
      throw new Error(`unexpected command: ${cmd}`);
    }

    token++;
    const mine = token;
    const { startOffset, chunkLength, onChunk } = args as unknown as {
      startOffset: number;
      chunkLength: number;
      onChunk: Channel<ArrayBuffer>;
    };

    log.push({ cmd, start: startOffset });

    const step = chunkLength / entries;
    let index = 0;

    for (let i = 0; i < entries; i++) {
      if (token !== mine) return; // killed

      tauriInternals().runCallback(onChunk.id, {
        index,
        message: encodeEntry({ offset: i * step, duration: step }),
      });
      index++;

      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    tauriInternals().runCallback(onChunk.id, { end: index });
  });

  return {
    log,
    chunkStarts: () =>
      log
        .filter((entry) => entry.cmd === "create_remux")
        .map((entry) => entry.start as number),
  };
}

function ranges() {
  try {
    return lastSourceBuffer().buffered.toArray();
  } catch {
    return [];
  }
}

async function waitFor(predicate: () => boolean, timeoutMs = 3000) {
  const startedAt = Date.now();

  while (!predicate()) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error("timed out waiting for condition");
    }
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let streams: SyncVideoStream[] = [];

function createStream(config?: Partial<SyncVideoStreamConfig>) {
  const stream = new SyncVideoStream("video.mp4", "audio.m4a", config);
  streams.push(stream);
  return stream;
}

afterEach(async () => {
  for (const stream of streams) await stream.dispose();
  streams = [];

  clearMocks();
  resetFakeMediaSource();
  vi.restoreAllMocks();
});

describe("SyncVideoStream", () => {
  it("fills two 60 second chunks on start", async () => {
    const ipc = installIpc();
    createStream();

    await waitFor(() => ipc.chunkStarts().length === 2);
    await waitFor(() => (ranges().at(-1)?.[1] ?? 0) >= 120);

    expect(ipc.chunkStarts()).toEqual([0, 60]);
    expect(ranges()).toEqual([[0, 120]]);
  });

  it("prefetches the next chunks when half a chunk is left", async () => {
    const ipc = installIpc();
    const stream = createStream();

    await waitFor(() => (ranges().at(-1)?.[1] ?? 0) >= 120);

    stream.update(95); // 25s futher - less than half of chunk

    await waitFor(() => ipc.chunkStarts().includes(120));
    await waitFor(() => (ranges().at(-1)?.[1] ?? 0) >= 240);

    expect(ipc.chunkStarts()).toEqual([0, 60, 120, 180]);
  });

  it("does not fetch while the buffer is healthy", async () => {
    const ipc = installIpc();
    const stream = createStream();

    await waitFor(() => (ranges().at(-1)?.[1] ?? 0) >= 120);

    stream.update(40);
    await delay(50);

    expect(ipc.chunkStarts()).toEqual([0, 60]);
  });

  it("evicts old ranges and loads around a forward seek", async () => {
    const ipc = installIpc();
    const stream = createStream();

    await waitFor(() => (ranges().at(-1)?.[1] ?? 0) >= 120);

    stream.update(240);

    await waitFor(() => ipc.chunkStarts().includes(240));
    await waitFor(() => (ranges().at(-1)?.[1] ?? 0) >= 300);

    expect(ranges().every(([start]) => start >= 209)).toBe(true);
    expect(ranges().some(([start, end]) => start <= 240 && end >= 300)).toBe(
      true,
    );
  });

  it("cancels an in-flight chunk when the position jumps away", async () => {
    const ipc = installIpc({ entriesPerChunk: 20, delayMs: 2 });
    const stream = createStream();

    await waitFor(() => (ranges().at(-1)?.[1] ?? 0) >= 120);

    stream.update(240);
    await waitFor(() => (ranges().at(-1)?.[1] ?? 0) >= 300);

    stream.update(30);
    await waitFor(() => ipc.chunkStarts().includes(30));
    stream.update(120);

    await waitFor(() => ipc.chunkStarts().includes(120));
    await waitFor(() => (ranges().at(-1)?.[1] ?? 0) >= 180);

    expect(ipc.log.some((entry) => entry.cmd === "clear_remux")).toBe(true);
    expect(ranges().every(([start, end]) => end <= 30 || start >= 119)).toBe(
      true,
    );
  });

  it("retries an append after QuotaExceededError", async () => {
    FakeMediaSource.nextSourceBufferQuotaFailure = true;
    installIpc();
    createStream();

    await waitFor(() => (ranges().at(-1)?.[1] ?? 0) >= 120);

    expect(ranges()).toEqual([[0, 120]]);
  });

  it("stops ffmpeg and revokes the blob url on dispose", async () => {
    const ipc = installIpc();
    const stream = createStream();

    await waitFor(() => (ranges().at(-1)?.[1] ?? 0) >= 120);

    const revoke = vi.spyOn(URL, "revokeObjectURL");
    await stream.dispose();

    expect(revoke).toHaveBeenCalledTimes(1);
    expect(ipc.log.some((entry) => entry.cmd === "clear_remux")).toBe(true);

    const requests = ipc.chunkStarts().length;
    await delay(30);
    expect(ipc.chunkStarts().length).toBe(requests);
  });
});
