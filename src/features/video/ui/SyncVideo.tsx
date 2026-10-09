import "@videojs/react/video/compat-skin.css";
import { useEffect, useState, useTransition } from "react";
import { clearRemuxVideo, createRemuxVideo } from "../api/SyncVideo";
import { VideoPlayer, CompatVideoSkin, Video } from "@videojs/react/video";

interface ISyncVideoProps {
  video: string;
  audio: string;
}

export default function SyncVideo({ video, audio }: ISyncVideoProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setSrc(await createRemuxVideo(video, audio));
    });

    return () => {
      clearRemuxVideo(video);
    };
  }, [video, audio]);

  return (
    <VideoPlayer>
      <CompatVideoSkin className="w-full aspect-video">
        {!!src && <Video src={src || ""} />}
      </CompatVideoSkin>
    </VideoPlayer>
  );
}
