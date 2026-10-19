import { open } from "@tauri-apps/plugin-dialog";
import { readDir, type DirEntry } from "@tauri-apps/plugin-fs";
import { ISyncPair } from "@/entities/syncs/model";
import { Logger } from "@/shared/logger";
import { family } from "@tauri-apps/plugin-os";

export async function getDirectory() {
  return await open({
    directory: true,
    multiple: false,
    recursive: false,
  });
}

const SEPARATOR = family() === "unix" ? "/" : "\\";

/** Characters that may separate a file stem from an extra label. */
const STEM_BOUNDARY = /[\s._\-([{]/;

/** names without an extension. */
function stemOf(name: string) {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

/**
 * A longer name only matches when the extra text starts after a separator.
 */
function matchesStem(videoStem: string, audioStem: string) {
  if (videoStem === audioStem) return true;

  if (videoStem.startsWith(audioStem)) {
    return STEM_BOUNDARY.test(videoStem.charAt(audioStem.length));
  }

  if (audioStem.startsWith(videoStem)) {
    return STEM_BOUNDARY.test(audioStem.charAt(videoStem.length));
  }

  return false;
}

interface AudioFile {
  entry: DirEntry;
  stem: string;
}

export async function createSyncPairs(videoDir: string, audioDir: string) {
  const videos = await readDir(videoDir);
  const audios = (await readDir(audioDir))
    .filter((entry) => !entry.isDirectory)
    .map<AudioFile>((entry) => ({
      entry,
      stem: stemOf(entry.name).toLowerCase(),
    }));

  const used = new Set<AudioFile>();
  const result: ISyncPair[] = [];

  for (const video of videos) {
    if (video.isDirectory) {
      Logger.warn(`[createSyncPairs]: video is directory`);
      continue;
    }

    const stem = stemOf(video.name).toLowerCase();
    let chosen: AudioFile | undefined;
    let chosenDistance = Number.POSITIVE_INFINITY;
    let candidates = 0;

    for (const audio of audios) {
      if (used.has(audio) || !matchesStem(stem, audio.stem)) continue;

      candidates++;
      const distance = Math.abs(audio.stem.length - stem.length);
      if (!chosen || distance < chosenDistance) {
        chosen = audio;
        chosenDistance = distance;
      }
    }

    if (!chosen) {
      Logger.warn(`[createSyncPairs]: no audio for "${video.name}"`);
      continue;
    }

    if (candidates > 1) {
      Logger.warn(
        `[createSyncPairs]: ${candidates} audio candidates for "${video.name}", using "${chosen.entry.name}"`,
      );
    }

    used.add(chosen);
    result.push({
      video: `${videoDir}${SEPARATOR}${video.name}`,
      audio: `${audioDir}${SEPARATOR}${chosen.entry.name}`,
    });
  }

  return result;
}
