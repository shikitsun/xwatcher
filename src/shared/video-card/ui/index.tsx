"use client";

import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { useEffect, useMemo, useState } from "react";

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
  const title = useMemo(() => {
    const fileName = src.split("/").pop()?.split("\\").pop();
    if (!fileName) return "";
    return fileName.slice(0, fileName.lastIndexOf("."));
  }, [src]);

  useEffect(() => {
    thumbnailPromise.then((val) => {
      setThumbnail(convertFileSrc(val));
    });
  }, []);

  return (
    <button
      className="card bg-base-300 w-xs shadow-sm cursor-pointer"
      onClick={onSelect}
    >
      <figure>
        <img src={thumbnail} alt={title} />
      </figure>

      <div className="card-body">
        <h2 className="card-title">{title}</h2>
      </div>
    </button>
  );
}
