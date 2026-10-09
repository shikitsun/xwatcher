import { useEffect, useState } from "react";
import { clearRemuxVideo, createRemuxVideo } from "../api/SyncVideo";

interface ISyncVideoProps {
  video: string;
  audio: string;
}

export default function SyncVideo({ video, audio }: ISyncVideoProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    createRemuxVideo(video, audio).then(setSrc);

    return () => {
      clearRemuxVideo(video);
    };
  }, [video, audio]);

  if (!src) return null;
  return <video src={src} controls></video>;
}
