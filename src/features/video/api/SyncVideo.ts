import { convertFileSrc, invoke } from "@tauri-apps/api/core";

export async function createRemuxVideo(video: string, audio: string) {
  return invoke<string>("create_remux", {
    videoUrl: video,
    audioUrl: audio,
  }).then((url) => convertFileSrc(url));
}

export async function clearRemuxVideo(video: string) {
  return invoke("clear_remux", {
    videoUrl: video,
  });
}
