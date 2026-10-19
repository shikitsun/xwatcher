import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tauri-apps/plugin-dialog", () => ({ open: vi.fn() }));
vi.mock("@tauri-apps/plugin-os", () => ({ family: () => "windows" }));
vi.mock("@tauri-apps/plugin-fs", () => ({ readDir: vi.fn() }));

import { readDir, type DirEntry } from "@tauri-apps/plugin-fs";
import { Logger } from "@/shared/logger";
import { createSyncPairs } from "./index";

const file = (name: string): DirEntry => ({
  name,
  isDirectory: false,
  isFile: true,
  isSymlink: false,
});

const folder = (name: string): DirEntry => ({
  name,
  isDirectory: true,
  isFile: false,
  isSymlink: false,
});

function setDirectories(videos: DirEntry[], audios: DirEntry[]) {
  vi.mocked(readDir).mockImplementation(async (path) =>
    path === "videos" ? videos : audios,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.mocked(readDir).mockReset();
});

describe("createSyncPairs", () => {
  it("pairs by the full stem regardless of directory order", async () => {
    setDirectories(
      [file("Ep1.mkv"), file("Ep10.mkv")],
      [file("Ep10.m4a"), file("Ep1.m4a")],
    );

    await expect(createSyncPairs("videos", "audio")).resolves.toEqual([
      { video: "videos\\Ep1.mkv", audio: "audio\\Ep1.m4a" },
      { video: "videos\\Ep10.mkv", audio: "audio\\Ep10.m4a" },
    ]);
  });

  it("does not pair Ep1 with Ep10 when Ep1 has no audio", async () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});
    setDirectories([file("Ep1.mkv")], [file("Ep10.m4a")]);

    await expect(createSyncPairs("videos", "audio")).resolves.toEqual([]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no audio"));
  });

  it("does not match an unrelated name that contains the stem", async () => {
    setDirectories([file("Ep1.mkv")], [file("MyEp1Remix.m4a")]);

    await expect(createSyncPairs("videos", "audio")).resolves.toEqual([]);
  });

  it("keeps the quality suffix out of the compared stem", async () => {
    setDirectories([file("Movie.2024.1080p.mkv")], [file("Movie.2024.m4a")]);

    await expect(createSyncPairs("videos", "audio")).resolves.toEqual([
      {
        video: "videos\\Movie.2024.1080p.mkv",
        audio: "audio\\Movie.2024.m4a",
      },
    ]);
  });

  it("accepts a suffix that starts after a separator", async () => {
    setDirectories([file("Ep1.mkv")], [file("Ep1 [L].m4a"), file("Ep10.m4a")]);

    await expect(createSyncPairs("videos", "audio")).resolves.toEqual([
      { video: "videos\\Ep1.mkv", audio: "audio\\Ep1 [L].m4a" },
    ]);
  });

  it("matches case-insensitively and handles names without an extension", async () => {
    setDirectories([file("EP1")], [file("ep1.m4a")]);

    await expect(createSyncPairs("videos", "audio")).resolves.toEqual([
      { video: "videos\\EP1", audio: "audio\\ep1.m4a" },
    ]);
  });

  it("uses an audio file only once", async () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});
    setDirectories(
      [file("Ep1.mkv"), file("Ep2.mkv")],
      [file("Ep1.m4a"), file("Ep2.m4a")],
    );

    const pairs = await createSyncPairs("videos", "audio");

    expect(pairs).toHaveLength(2);
    expect(new Set(pairs.map((pair) => pair.audio)).size).toBe(2);
    expect(warn).not.toHaveBeenCalled();
  });

  it("skips directories on both sides", async () => {
    setDirectories(
      [folder("season-1"), file("Ep1.mkv")],
      [folder("extras"), file("Ep1.m4a")],
    );

    await expect(createSyncPairs("videos", "audio")).resolves.toEqual([
      { video: "videos\\Ep1.mkv", audio: "audio\\Ep1.m4a" },
    ]);
  });
});
