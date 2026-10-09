import { useRef, useState } from "react";
import { createSyncPairs, getDirectory } from "../api";
import { ISyncPair } from "@/entities/syncs/model";

interface ISyncsDirInputModalProps {
  onLoad: (data: ISyncPair[]) => void;
}

export default function SyncsDirInputModal({
  onLoad,
}: ISyncsDirInputModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [videoDir, setVideoDir] = useState<string | null>(null);
  const [audioDir, setAudioDir] = useState<string | null>(null);

  return (
    <>
      <button
        className="btn btn-outline btn-accent"
        onClick={() => ref.current?.show()}
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
              onClick={async () => {
                setVideoDir(await getDirectory());
              }}
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
              onClick={async () => {
                setAudioDir(await getDirectory());
              }}
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

          <div className="modal-action">
            <button className="btn" onClick={() => ref.current?.close()}>
              Close
            </button>
            <button
              className="btn btn-success"
              disabled={!videoDir || !audioDir}
              onClick={async (ev) => {
                if (!videoDir || !audioDir) {
                  ev.preventDefault();
                  return;
                }
                onLoad(await createSyncPairs(videoDir, audioDir));
                ref.current?.close();
              }}
            >
              Load
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
