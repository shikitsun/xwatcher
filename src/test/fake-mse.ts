/**
 * Mocks for MediaSource Extension (MSE)
 * Cover only used API
 */

export class FakeTimeRanges {
  #ranges: Array<[number, number]> = [];

  get length() {
    return this.#ranges.length;
  }

  start(index: number) {
    return this.#ranges[index][0];
  }

  end(index: number) {
    return this.#ranges[index][1];
  }

  add(start: number, end: number) {
    if (!(end > start)) return;

    this.#ranges.push([start, end]);
    this.#ranges.sort((a, b) => a[0] - b[0]);

    const merged: Array<[number, number]> = [];
    for (const range of this.#ranges) {
      const last = merged[merged.length - 1];
      if (last && range[0] <= last[1] + 1e-9) {
        last[1] = Math.max(last[1], range[1]);
      } else {
        merged.push([range[0], range[1]]);
      }
    }
    this.#ranges = merged;
  }

  remove(start: number, end: number) {
    const next: Array<[number, number]> = [];

    for (const [rangeStart, rangeEnd] of this.#ranges) {
      if (rangeEnd <= start || rangeStart >= end) {
        next.push([rangeStart, rangeEnd]);
        continue;
      }
      if (rangeStart < start) next.push([rangeStart, start]);
      if (rangeEnd > end) next.push([end, rangeEnd]);
    }

    this.#ranges = next;
  }

  toArray(): Array<[number, number]> {
    return this.#ranges.map(([start, end]) => [start, end]);
  }
}

export class FakeSourceBuffer extends EventTarget {
  readonly buffered = new FakeTimeRanges();
  updating = false;
  timestampOffset = 0;
  /** how much appendBuffer should catch QuotaExceededError. */
  quotaFailures = 0;

  appendBuffer(data: BufferSource) {
    if (this.updating) {
      throw new DOMException("append while updating", "InvalidStateError");
    }

    if (this.quotaFailures > 0) {
      this.quotaFailures--;
      throw new DOMException("quota exceeded", "QuotaExceededError");
    }

    const bytes =
      data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const decoder = new TextDecoder();

    let cursor = 0;
    while (cursor + 4 <= bytes.byteLength) {
      const size = view.getUint32(cursor);
      cursor += 4;
      const entry = JSON.parse(
        decoder.decode(bytes.subarray(cursor, cursor + size)),
      ) as { offset: number; duration: number };
      cursor += size;

      const start = this.timestampOffset + entry.offset;
      this.buffered.add(start, start + entry.duration);
    }

    this.finishUpdate();
  }

  remove(start: number, end: number) {
    if (this.updating) {
      throw new DOMException("remove while updating", "InvalidStateError");
    }

    this.buffered.remove(start, end);
    this.finishUpdate();
  }

  abort() {
    this.updating = false;
    queueMicrotask(() => this.dispatchEvent(new Event("abort")));
  }

  private finishUpdate() {
    this.updating = true;
    queueMicrotask(() => {
      this.updating = false;
      this.dispatchEvent(new Event("updateend"));
    });
  }
}

export class FakeMediaSource extends EventTarget {
  static instances: FakeMediaSource[] = [];
  /** First SourceBuffer of next instance fall with QuotaExceededError. */
  static nextSourceBufferQuotaFailure = false;

  static isTypeSupported() {
    return true;
  }

  readyState: "closed" | "open" | "ended" = "open";
  duration = NaN;
  sourceBuffers: FakeSourceBuffer[] = [];

  constructor() {
    super();
    FakeMediaSource.instances.push(this);
    queueMicrotask(() => this.dispatchEvent(new Event("sourceopen")));
  }

  addSourceBuffer() {
    const sourceBuffer = new FakeSourceBuffer();

    if (FakeMediaSource.nextSourceBufferQuotaFailure) {
      sourceBuffer.quotaFailures = 1;
      FakeMediaSource.nextSourceBufferQuotaFailure = false;
    }

    this.sourceBuffers.push(sourceBuffer);
    return sourceBuffer;
  }
}

export function lastSourceBuffer(): FakeSourceBuffer {
  const mediaSource = FakeMediaSource.instances.at(-1);
  const sourceBuffer = mediaSource?.sourceBuffers.at(-1);

  if (!sourceBuffer) {
    throw new Error("FakeMediaSource: source buffer is not created yet");
  }

  return sourceBuffer;
}

export function resetFakeMediaSource() {
  FakeMediaSource.instances = [];
  FakeMediaSource.nextSourceBufferQuotaFailure = false;
}
