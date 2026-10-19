"use client";

import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { useEffect, useMemo, useState } from "react";
import { Logger } from "@/shared/logger";

interface IVideoCardProps {
  src: string;
  onSelect: () => void;
}

/**
 * Preview of video
 */
export default function VideoCard({ src, onSelect }: IVideoCardProps) {
  const thumbnailPromise = useMemo(
    () => invoke<string>("make_thumbnail", { videoUrl: src }),
    [src],
  );

  const [thumbnail, setThumbnail] = useState<string>();
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const title = useMemo(() => {
    const fileName = src.split("/").pop()?.split("\\").pop();
    if (!fileName) return "";
    return fileName.slice(0, fileName.lastIndexOf("."));
  }, [src]);

  useEffect(() => {
    let cancelled = false;

    thumbnailPromise
      .then((val) => {
        if (!cancelled) setThumbnail(convertFileSrc(val));
      })
      .catch((error: unknown) => {
        Logger.error("[VideoCard]: thumbnail failed", error);
        if (!cancelled) setThumbnailFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [thumbnailPromise]);

  return (
    <button
      className="card bg-base-300 w-xs shadow-sm cursor-pointer"
      onClick={onSelect}
    >
      <figure className="aspect-video bg-base-200">
        {thumbnail ? (
          <img className="size-full object-cover" src={thumbnail} alt={title} />
        ) : thumbnailFailed ? (
          <div
            role="img"
            aria-label={`${title}: no preview`}
            className="flex size-full items-center justify-center text-xs opacity-60"
          >
            No preview
          </div>
        ) : (
          <div className="skeleton size-full" aria-hidden="true" />
        )}
      </figure>

      <div className="card-body">
        <h2 className="card-title">{title}</h2>
      </div>
    </button>
  );
}
