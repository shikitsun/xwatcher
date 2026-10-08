import { open } from "@tauri-apps/plugin-dialog";
import { readDir } from "@tauri-apps/plugin-fs";

export async function getFilesOfDirectory() {
  return await open({
    directory: true,
    multiple: false,
    recursive: false,
  });
}

export async function createSyncPairs(videoDir: string, audioDir: string) {
  // assume there are real videos
  const videos = await readDir(videoDir);
  const audios = await readDir(audioDir);
}
