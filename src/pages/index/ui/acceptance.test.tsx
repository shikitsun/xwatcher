// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearMocks, mockConvertFileSrc, mockIPC } from "@tauri-apps/api/mocks";
import type { Channel } from "@tauri-apps/api/core";
import { BrowserRouter } from "react-router";
import App from "@/app/App";

vi.mock("@tauri-apps/plugin-dialog", () => ({ open: vi.fn() }));
vi.mock("@tauri-apps/plugin-os", () => ({ family: () => "windows" }));
vi.mock("@tauri-apps/plugin-fs", () => ({ readDir: vi.fn() }));

import { open } from "@tauri-apps/plugin-dialog";
import { readDir, type DirEntry } from "@tauri-apps/plugin-fs";
import { encodeEntry, tauriInternals } from "@/test/utils";

const entry = (name: string): DirEntry => ({
  name,
  isDirectory: false,
  isFile: true,
  isSymlink: false,
});

let remuxStarts: number[];

beforeEach(() => {
  remuxStarts = [];

  mockConvertFileSrc("windows");
  mockIPC(async (cmd, args) => {
    if (cmd === "make_thumbnail") return "C:/cache/Ep1.jpg";
    if (cmd === "probe_video_duration") return 300;
    if (cmd === "clear_remux") return;

    if (cmd !== "create_remux") {
      throw new Error(`unexpected command: ${cmd}`);
    }

    const { startOffset, chunkLength, onChunk } = args as unknown as {
      startOffset: number;
      chunkLength: number;
      onChunk: Channel<ArrayBuffer>;
    };

    remuxStarts.push(startOffset);
    tauriInternals().runCallback(onChunk.id, {
      index: 0,
      message: encodeEntry({ offset: 0, duration: chunkLength }),
    });
    tauriInternals().runCallback(onChunk.id, { end: 1 });
  });
});

afterEach(() => {
  cleanup();
  clearMocks();
  vi.clearAllMocks();
});

describe("load pairs and start playback", () => {
  it("load -> select -> play with the real page and player", async () => {
    const user = userEvent.setup();

    vi.mocked(open)
      .mockResolvedValueOnce("C:/videos")
      .mockResolvedValueOnce("C:/audio");
    vi.mocked(readDir).mockImplementation(async (dir) =>
      dir === "C:/videos" ? [entry("Ep1.mkv")] : [entry("Ep1.m4a")],
    );

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    await user.click(screen.getByLabelText("Load"));

    const dialog = document.querySelector("dialog");
    expect(dialog).not.toBeNull();

    const selects = within(dialog as HTMLElement).getAllByLabelText("Select");
    await user.click(selects[0]);
    await user.click(selects[1]);

    await user.click(
      within(dialog as HTMLElement).getByRole("button", { name: "Load" }),
    );

    const card = await screen.findByRole("button", { name: /Ep1/ });
    expect((dialog as HTMLDialogElement).open).toBe(false);
    await user.click(card);

    await waitFor(() => {
      expect(document.querySelector("video")).not.toBeNull();
    });

    expect(document.querySelector("video")?.getAttribute("src")).toBe(
      "blob:sync-video-test",
    );
    expect(remuxStarts).toContain(0);
  });

  it("keeps the dialog open and shows the reason when loading fails", async () => {
    const user = userEvent.setup();
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(open)
      .mockResolvedValueOnce("C:/videos")
      .mockResolvedValueOnce("C:/audio");
    vi.mocked(readDir).mockRejectedValue(new Error("permission denied"));

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    await user.click(screen.getByLabelText("Load"));

    const dialog = document.querySelector("dialog") as HTMLDialogElement;
    const selects = within(dialog).getAllByLabelText("Select");
    await user.click(selects[0]);
    await user.click(selects[1]);
    await user.click(within(dialog).getByRole("button", { name: "Load" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "permission denied",
    );
    expect(dialog.open).toBe(true);

    errorLog.mockRestore();
  });
});
