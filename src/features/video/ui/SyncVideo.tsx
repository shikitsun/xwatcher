import { useEffect, useState, useTransition } from "react";
import { clearRemuxVideo, createRemuxVideo } from "../api/SyncVideo";
import { VideoPlayer, Video } from "@videojs/react/video";
import { VideoSkin } from "@/components/videojs/video/skin";
import { Container } from "@videojs/react";

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
      <Container className="animate-in px-2">
        <VideoSkin className="w-full aspect-video">
          {!!src && <Video src={src || ""} />}
        </VideoSkin>
        {isLoading || !src ? (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
            <span className="loading loading-spinner"></span>
            <span className="sr-only">Loading</span>
          </div>
        ) : null}
      </Container>
    </VideoPlayer>
  );
}
