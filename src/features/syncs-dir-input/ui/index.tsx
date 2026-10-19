import { useRef, useState } from "react";
import { createSyncPairs, getDirectory } from "../api";
import { ISyncPair } from "@/entities/syncs/model";
import { Logger } from "@/shared/logger";
import { errorMessage } from "@/lib/error-message";

interface ISyncsDirInputModalProps {
  onLoad: (data: ISyncPair[]) => void;
}

export default function SyncsDirInputModal({
  onLoad,
}: ISyncsDirInputModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [videoDir, setVideoDir] = useState<string | null>(null);
  const [audioDir, setAudioDir] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pickDirectory(target: "video" | "audio") {
    setError(null);

    try {
      const dir = await getDirectory();
      if (!dir) return;
      if (target === "video") setVideoDir(dir);
      else setAudioDir(dir);
    } catch (cause) {
      Logger.error("[SyncsDirInputModal]: directory pick failed", cause);
      setError(errorMessage(cause));
    }
  }

  async function load() {
    if (!videoDir || !audioDir || loading) return;

    setLoading(true);
    setError(null);

    try {
      const pairs = await createSyncPairs(videoDir, audioDir);
      onLoad(pairs);
      ref.current?.close();
    } catch (cause) {
      Logger.error("[SyncsDirInputModal]: loading pairs failed", cause);
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        className="btn btn-outline btn-accent"
        onClick={() => ref.current?.showModal()}
        aria-label="Load"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"
          />
        </svg>
      </button>

      <dialog ref={ref} className="modal" closedby="any">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Load sync pairs</h3>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Video</legend>
            <button
              className="btn btn-outline btn-primary"
              onClick={() => void pickDirectory("video")}
              aria-label="Select"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"
                />
              </svg>
            </button>
            <p className="text-success text-xs">{videoDir}</p>
            <label className="label">
              Parent directory, which contains video files
            </label>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Audio</legend>
            <button
              className="btn btn-outline btn-primary"
              onClick={() => void pickDirectory("audio")}
              aria-label="Select"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"
                />
              </svg>
            </button>
            <p className="text-success text-xs">{audioDir}</p>
            <label className="label">
              Parent directory, which contains audio files
            </label>
          </fieldset>

          <p className="py-4">Select video and audio source directories</p>

          {error && (
            <div role="alert" className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <div className="modal-action">
            <button className="btn" onClick={() => ref.current?.close()}>
              Close
            </button>
            <button
              className="btn btn-success"
              disabled={!videoDir || !audioDir || loading}
              onClick={() => void load()}
            >
              {loading ? "Loading…" : "Load"}
            </button>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
