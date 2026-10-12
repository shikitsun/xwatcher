import { Channel, invoke } from "@tauri-apps/api/core";

// Could use zustand store as well
// But for now keep it in variable is fine
// Also could use function for scope, but use class for clarity

class StreamStore {
  #data: Record<string, string> = {};

  add(id: string, value: string) {
    this.#data[id] = value;
  }

  getById(id: string) {
    return this.#data[id];
  }
}

const store = new StreamStore();

// Public API
export async function createRemuxVideo(video: string, audio: string) {
  const mediaSource = new MediaSource();

  mediaSource.addEventListener("sourceopen", async () => {
    const mime = 'video/mp4; codecs="avc1.4D4028, mp4a.40.2"';

    if (!MediaSource.isTypeSupported(mime)) {
      throw new Error(`Unsupported MIME/codecs: ${mime}`);
    }

    const sourceBuffer = mediaSource.addSourceBuffer(mime);
    const queue: BufferSource[] = [];
    let finished = false;

    function appendBuffer(value: BufferSource) {
      try {
        sourceBuffer.appendBuffer(value);
      } catch (e) {
        console.error(e);
        clearRemuxVideo(video);
      }
    }

    sourceBuffer.addEventListener("updateend", () => {
      if (!sourceBuffer.updating && queue.length) {
        appendBuffer(queue.shift()!);
      } else if (finished && mediaSource.readyState === "open") {
        mediaSource.endOfStream();
      }
    });

    const onChunk = new Channel();
    onChunk.onmessage = (arrayBuffer) => {
      queue.push(arrayBuffer as BufferSource);
      if (!sourceBuffer.updating) {
        appendBuffer(queue.shift()!);
      }
    };

    try {
      await invoke<string>("create_remux", {
        videoUrl: video,
        audioUrl: audio,
        onChunk,
      });
      finished = true;
      if (!sourceBuffer.updating && queue.length === 0) {
        mediaSource.endOfStream();
      }
    } catch (err) {
      console.error("Mux stream failed:", err);
    }
  });

  const url = URL.createObjectURL(mediaSource);
  store.add(video, url);
  return url;
}

export async function clearRemuxVideo(video: string) {
  await invoke("clear_remux", {
    videoUrl: video,
  });
  URL.revokeObjectURL(store.getById(video));
}
