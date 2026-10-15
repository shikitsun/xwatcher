import { open } from "@tauri-apps/plugin-dialog";
import { readDir } from "@tauri-apps/plugin-fs";
import { ISyncPair } from "@/entities/syncs/model";
import { Logger } from "@/shared/logger";
import { family } from "@tauri-apps/plugin-os";

// focus on remuxer part for now
export async function getDirectory() {
  return await open({
    directory: true,
    multiple: false,
    recursive: false,
  });
}

const SEPARATOR = family() === "unix" ? "/" : "\\";

export async function createSyncPairs(videoDir: string, audioDir: string) {
  // assume there are real videos
  const videos = await readDir(videoDir);
  const audios = await readDir(audioDir);
  const result: ISyncPair[] = [];
  for (const video of videos) {
    if (video.isDirectory) {
      Logger.warn(`[createSyncPairs]: video is directory`);
      continue;
    }
    const [name] = video.name.split(".");
    // find audio by matching name from audio
    const audio = audios.find((audio) => audio.name.startsWith(name));
    if (!audio || audio.isDirectory) continue;

    result.push({
      video: `${videoDir}${SEPARATOR}${video.name}`,
      audio: `${audioDir}${SEPARATOR}${audio.name}`,
    });
  }

  return result;
}
