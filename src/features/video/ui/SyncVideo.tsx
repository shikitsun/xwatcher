import { useEffect, useState } from "react";
import { SyncVideoStream } from "../api/SyncVideo";
import { VideoPlayer, Video } from "@videojs/react/video";
import { VideoSkin } from "@/components/videojs/video/skin";
import { Container } from "@videojs/react";

interface ISyncVideoProps {
  video: string;
  audio: string;
}

export default function SyncVideo({ video, audio }: ISyncVideoProps) {
  const [sync, setSync] = useState<SyncVideoStream | null>(null);

  useEffect(() => {
    const stream = new SyncVideoStream(video, audio);
    setSync(stream);

    return () => {
      setSync((current) => (current === stream ? null : current));
      stream.dispose();
    };
  }, [video, audio]);

  function update<T extends Pick<Event, "target">>(ev: T) {
    sync?.update((ev.target as HTMLVideoElement).currentTime);
  }

  return (
    <VideoPlayer>
      <Container className="animate-in px-2">
        <VideoSkin className="w-full aspect-video">
          {!!sync && (
            <Video
              src={sync.url}
              onTimeUpdate={update}
              onSeeking={update}
              onSeeked={update}
              onWaiting={update}
            />
          )}
        </VideoSkin>
      </Container>
    </VideoPlayer>
  );
}
