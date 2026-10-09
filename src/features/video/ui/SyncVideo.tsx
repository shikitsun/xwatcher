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
    <div className="relative fade-out">
      <VideoPlayer>
        <CompatVideoSkin className="w-full aspect-video">
          {!!src && <Video src={src || ""} />}
        </CompatVideoSkin>
        {isLoading || !src ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <span className="loading loading-spinner"></span>
            <span className="sr-only">Loading</span>
          </div>
        ) : null}
      </VideoPlayer>
    </div>
  );
}
