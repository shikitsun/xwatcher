"use client";

import { ISyncPair } from "@/entities/syncs/model";
import SyncsDirInputModal from "@/features/syncs-dir-input/ui";
import SyncVideo from "@/features/video/ui/SyncVideo";
import VideoCard from "@/shared/video-card/ui";
import { useState } from "react";

export default function IndexPage() {
  const [pairs, setPairs] = useState<ISyncPair[]>([]);
  const [active, setActive] = useState<ISyncPair | null>(null);

  return (
    <article>
      <SyncsDirInputModal onLoad={setPairs} />

      {active && <SyncVideo video={active.video} audio={active.audio} />}

      <ul className="flex items-center justify-center flex-wrap mx-auto gap-y-2 gap-x-2">
        {pairs.map((pair) => (
          <li key={pair.video}>
            <VideoCard src={pair.video} onSelect={() => setActive(pair)} />
          </li>
        ))}
      </ul>
    </article>
  );
}
