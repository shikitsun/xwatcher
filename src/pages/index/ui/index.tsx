"use client";

import { ISyncPair } from "@/entities/syncs/model";
import SyncsDirInputModal from "@/features/syncs-dir-input/ui";
import SyncVideo from "@/features/video/ui/SyncVideo";
import VideoCard from "@/shared/video-card/ui";
import { Activity, useState } from "react";

export default function IndexPage() {
  const [pairs, setPairs] = useState<ISyncPair[]>([]);
  const [active, setActive] = useState<ISyncPair | null>(null);

  return (
    <article className="flex flex-col gap-y-2">
      <div className="flex items-center justify-end py-4 px-4 gap-x-4">
        <SyncsDirInputModal onLoad={setPairs} />
        {active && (
          <button
            className="btn btn-outline btn-warning"
            onClick={() => setActive(null)}
            aria-label="Close"
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
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {active && <SyncVideo video={active.video} audio={active.audio} />}

      <Activity mode={active ? "hidden" : "visible"}>
        <ul className="flex items-center justify-center flex-wrap mx-auto gap-y-2 gap-x-2 fade-out">
          {pairs.map((pair) => (
            <li key={pair.video}>
              <VideoCard src={pair.video} onSelect={() => setActive(pair)} />
            </li>
          ))}
        </ul>
      </Activity>
    </article>
  );
}
