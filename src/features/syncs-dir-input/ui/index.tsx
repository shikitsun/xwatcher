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
      <button className="btn" onClick={() => ref.current?.show()}>
        Load
      </button>
      <dialog ref={ref} className="modal" closedby="any">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Load sync pairs</h3>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Video</legend>
            <button
              className="btn"
              onClick={async () => {
                setVideoDir(await getDirectory());
              }}
            >
              {videoDir || "Select"}
            </button>
            <label className="label">
              Parent directory, which contains video files
            </label>
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Audio</legend>
            <button
              className="btn"
              onClick={async () => {
                setAudioDir(await getDirectory());
              }}
            >
              {audioDir || "Select"}
            </button>
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
