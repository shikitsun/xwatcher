import { Channel, invoke } from "@tauri-apps/api/core";

/** Configuration for remuxing streaming. */
export interface SyncVideoStreamConfig {
  /**
   * Size of single chunk. In seconds
   * */
  chunk: number;
  /**
   * How much load next relative to current position. In seconds
   * */
  bufferAhead: number;
  /**
   * How much keep loaded before current position (current - keepBehind)
   * */
  keepBehind: number;
  /**
   * bufferAhead - seconds (prefetch) before start preload next chunk
   * */
  prefetch: number;
}

export const DEFAULT_SYNC_VIDEO_CONFIG: SyncVideoStreamConfig = {
  chunk: 60,
  bufferAhead: 120,
  keepBehind: 30,
  prefetch: 30,
};

const MIME = 'video/mp4; codecs="avc1.4D4028, mp4a.40.2"';
const APPEND_BATCH_BYTES = 1024 * 1024;

if (!MediaSource.isTypeSupported(MIME)) {
  throw new Error(`Unsupported MIME/codecs: ${MIME}`);
}

/**
 * Find latest correct end for time
 */
function bufferedRunEnd(
  buffer: TimeRanges,
  time: number,
  tolerance = 0.5,
  joinGap = 1,
): number | null {
  let end: number | null = null;

  for (let i = 0; i < buffer.length; i++) {
    if (time >= buffer.start(i) - tolerance && time <= buffer.end(i)) {
      end = buffer.end(i);
      break;
    }
  }

  if (end === null) return null;

  let grown = true;
  while (grown) {
    grown = false;
    for (let i = 0; i < buffer.length; i++) {
      if (buffer.start(i) <= end + joinGap && buffer.end(i) > end) {
        end = buffer.end(i);
        grown = true;
      }
    }
  }

  return end;
}

function waitForUpdateEnd(buffer: SourceBuffer): Promise<void> {
  if (!buffer.updating) return Promise.resolve();

  return new Promise((resolve) => {
    const done = () => {
      buffer.removeEventListener("updateend", done);
      buffer.removeEventListener("abort", done);
      resolve();
    };

    buffer.addEventListener("updateend", done);
    buffer.addEventListener("abort", done);
  });
}

interface FetchRegion {
  start: number;
  end: number;
}

export class SyncVideoStream {
  #videoUrl: string;
  #audioUrl: string;
  #url: string;
  #config: SyncVideoStreamConfig;
  #mediaSource = new MediaSource();
  #sourceBuffer: SourceBuffer | null = null;
  #duration = 0;

  /** current time */
  #now = 0;
  /** Are currently processing new chunks */
  #running = false;
  /** Started fill */
  #refilling = false;
  /** Start prefetch from that position */
  #fillAnchor = 0;
  /** Loaded chunk. Need for actuality check */
  #fetch: FetchRegion | null = null;
  /** Invalidate results before seek started */
  #generation = 0;
  #disposed = false;

  get url() {
    return this.#url;
  }

  constructor(
    videoUrl: string,
    audioUrl: string,
    config: Partial<SyncVideoStreamConfig> = {},
  ) {
    this.#videoUrl = videoUrl;
    this.#audioUrl = audioUrl;
    this.#config = this.#resolveConfig(config);

    this.#mediaSource.addEventListener("sourceopen", () => {
      void this.#onSourceOpen();
    });

    this.#url = URL.createObjectURL(this.#mediaSource);
  }

  #resolveConfig(
    config: Partial<SyncVideoStreamConfig>,
  ): SyncVideoStreamConfig {
    // Load at least 5 seconds of chunk
    const chunk = Math.max(5, config.chunk ?? DEFAULT_SYNC_VIDEO_CONFIG.chunk);
    const bufferAhead = Math.max(
      chunk,
      config.bufferAhead ?? DEFAULT_SYNC_VIDEO_CONFIG.bufferAhead,
    );

    return {
      chunk,
      bufferAhead,
      keepBehind: Math.max(
        0,
        config.keepBehind ?? DEFAULT_SYNC_VIDEO_CONFIG.keepBehind,
      ),
      prefetch: Math.min(
        chunk,
        Math.max(
          0,
          config.prefetch ??
            (config.chunk ?? DEFAULT_SYNC_VIDEO_CONFIG.chunk) / 2,
        ),
      ),
    };
  }

  async #onSourceOpen() {
    if (this.#disposed) return;

    this.#sourceBuffer = this.#mediaSource.addSourceBuffer(MIME);

    await this.#loadDuration();
    if (this.#disposed) return;

    if (Number.isFinite(this.#duration) && this.#duration > 0) {
      try {
        this.#mediaSource.duration = this.#duration;
      } catch (error) {
        console.error("SyncVideoStream: cannot set duration", error);
      }
    }

    this.#schedule();
  }

  async #loadDuration() {
    try {
      this.#duration = await invoke<number>("probe_video_duration", {
        videoUrl: this.#videoUrl,
      });
    } catch (e) {
      console.error("probe_video_duration failed:", e);
      this.#duration = 0;
    }
  }

  /**
   * Update currentTime from external sources
   */
  update(now: number) {
    if (this.#disposed || !Number.isFinite(now)) return;

    this.#now = Math.max(0, now);

    // Start or seeking, where no buffer: load
    // Count from start
    const sourceBuffer = this.#sourceBuffer;
    if (sourceBuffer) {
      const end = bufferedRunEnd(sourceBuffer.buffered, this.#now);
      if (end === null) {
        this.#refilling = true;
        this.#fillAnchor = this.#now;
      }
    }

    // If current fetch not within new interval - drop it
    const fetch = this.#fetch;
    if (fetch) {
      const from = this.#now - this.#config.keepBehind;
      const to = this.#now + this.#config.bufferAhead;
      if (fetch.end <= from || fetch.start >= to) this.#abortFetch();
    }

    this.#schedule();
  }

  #schedule() {
    if (this.#running || this.#disposed || !this.#sourceBuffer) return;
    this.#fill();
  }

  async #fill() {
    const sourceBuffer = this.#sourceBuffer;
    if (!sourceBuffer || this.#disposed) return;

    this.#running = true;

    try {
      while (true) {
        if (this.#disposed || this.#sourceBuffer !== sourceBuffer) return;

        const now = this.#now;

        // Remove some behind data
        await this.#evict(sourceBuffer, now);
        if (this.#disposed) return;

        const end = bufferedRunEnd(sourceBuffer.buffered, now);
        const ahead = end === null ? 0 : end - now;

        if (!this.#refilling) {
          // If no need prefetch more just stop
          if (end !== null && ahead > this.#config.prefetch) return;
          this.#refilling = true;
          this.#fillAnchor = now;
        }

        // Keep bufferAhead seconds from start
        // No extra chunks
        if (
          end !== null &&
          end - this.#fillAnchor >= this.#config.bufferAhead
        ) {
          this.#refilling = false;
          return;
        }

        const start = end === null ? now : end;
        if (this.#duration > 0 && start >= this.#duration - 0.05) return;

        const length =
          this.#duration > 0
            ? Math.min(this.#config.chunk, this.#duration - start)
            : this.#config.chunk;

        if (length <= 0.05) return;

        const generation = this.#generation;
        this.#fetch = { start, end: start + length };

        let appended = 0;
        try {
          appended = await this.#streamChunk(
            sourceBuffer,
            start,
            length,
            generation,
          );
        } finally {
          this.#fetch = null;
        }

        // While loading, generation already changed - no more needed. Drop it
        if (generation !== this.#generation) continue;

        // No data added
        if (appended === 0) {
          if (this.#duration <= 0) this.#duration = start;
          return;
        }
      }
    } catch (error) {
      console.error("SyncVideoStream: fill failed", error);
    } finally {
      this.#running = false;
    }
  }

  /**
   * Start remux job for [start, start + length]
   */
  async #streamChunk(
    sourceBuffer: SourceBuffer,
    start: number,
    length: number,
    generation: number,
  ): Promise<number> {
    const parts: Uint8Array[] = [];
    let pendingBytes = 0;
    let notify: () => void = () => {};
    let finished = false;
    let appended = 0;

    const onChunk = new Channel<ArrayBuffer>();
    onChunk.onmessage = (data) => {
      if (this.#disposed || generation !== this.#generation) return;
      if (!data || data.byteLength === 0) return;
      parts.push(new Uint8Array(data));
      pendingBytes += data.byteLength;
      notify();
    };

    const takeBatch = () => {
      const merged = new Uint8Array(pendingBytes);
      let offset = 0;
      for (const part of parts) {
        merged.set(part, offset);
        offset += part.byteLength;
      }
      // Empty array
      parts.length = 0;
      pendingBytes = 0;
      return merged;
    };

    const pump = (async () => {
      let positioned = false;

      const append = async (data: BufferSource) => {
        await waitForUpdateEnd(sourceBuffer);
        if (this.#disposed || generation !== this.#generation) return;

        if (!positioned) {
          sourceBuffer.timestampOffset = start;
          positioned = true;
        }

        await this.#appendBuffer(sourceBuffer, data);
        appended++;
      };

      while (true) {
        if (this.#disposed || generation !== this.#generation) return;

        if (pendingBytes >= APPEND_BATCH_BYTES) {
          await append(takeBatch());
          continue;
        }

        if (finished) {
          if (pendingBytes > 0) await append(takeBatch());
          return;
        }

        await new Promise<void>((resolve) => {
          notify = resolve;
        });
        notify = () => {};
      }
    })();

    let failure: unknown = null;
    try {
      await invoke("create_remux", {
        videoUrl: this.#videoUrl,
        audioUrl: this.#audioUrl,
        onChunk,
        startOffset: start,
        chunkLength: length,
      });
    } catch (error) {
      failure = error;
    }

    // Wait for IPC
    await new Promise((resolve) => setTimeout(resolve, 0));
    finished = true;
    notify();
    notify = () => {};

    try {
      await pump;
    } catch (error) {
      failure ??= error;
      invoke("clear_remux", { videoUrl: this.#videoUrl }).catch(() => {});
    }

    if (failure && !this.#disposed && generation === this.#generation) {
      throw failure;
    }

    return appended;
  }

  async #appendBuffer(sourceBuffer: SourceBuffer, data: BufferSource) {
    await waitForUpdateEnd(sourceBuffer);

    try {
      sourceBuffer.appendBuffer(data);
    } catch (error) {
      if (
        !(error instanceof DOMException) ||
        error.name !== "QuotaExceededError"
      ) {
        throw error;
      }

      // No room for new data, evict with aggressive = true (prefer remove old content than newest)
      // And retry
      await this.#evict(sourceBuffer, this.#now, true);
      await waitForUpdateEnd(sourceBuffer);
      sourceBuffer.appendBuffer(data);
    }

    await waitForUpdateEnd(sourceBuffer);
  }

  /**
   * Keep only some data in sourceBuffer
   * [now - keepBehind, now + bufferAhead + chunk].
   */
  async #evict(sourceBuffer: SourceBuffer, now: number, aggressive = false) {
    const from = aggressive ? now : now - this.#config.keepBehind;
    const to = now + this.#config.bufferAhead + this.#config.chunk;

    const ranges: Array<{ start: number; end: number }> = [];
    for (let i = 0; i < sourceBuffer.buffered.length; i++) {
      ranges.push({
        start: sourceBuffer.buffered.start(i),
        end: sourceBuffer.buffered.end(i),
      });
    }

    for (const range of ranges) {
      if (range.end <= from || range.start >= to) {
        await this.#remove(sourceBuffer, range.start, range.end);
        continue;
      }

      // Keep behind some data with few seconds
      // Less triggers on timeupdate event
      if (range.start < from - 2) {
        await this.#remove(sourceBuffer, range.start, from);
      }

      if (range.end > to) {
        await this.#remove(sourceBuffer, to, range.end);
      }
    }
  }

  async #remove(sourceBuffer: SourceBuffer, start: number, end: number) {
    if (!(end > start)) return;

    await waitForUpdateEnd(sourceBuffer);

    try {
      sourceBuffer.remove(start, end);
    } catch {
      return;
    }

    await waitForUpdateEnd(sourceBuffer);
  }

  #abortFetch() {
    this.#generation++;
    this.#fetch = null;

    try {
      this.#sourceBuffer?.abort();
    } catch {
      // SourceBuffer possible already closed
    }

    invoke("clear_remux", { videoUrl: this.#videoUrl }).catch(() => {});
  }

  async dispose() {
    if (this.#disposed) return;
    this.#disposed = true;
    this.#generation++;
    this.#fetch = null;

    try {
      this.#sourceBuffer?.abort();
    } catch {
      // SourceBuffer possible already closed
    }

    try {
      await invoke("clear_remux", { videoUrl: this.#videoUrl });
    } catch {}

    URL.revokeObjectURL(this.#url);
  }
}
