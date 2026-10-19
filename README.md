# XWatcher — play a video with a different audio track

XWatcher pairs video files with audio files and plays them as one stream, like VLC's
"play audio with video" workflow. Point it at a directory of videos and a directory of
audio; matching files become cards on the home screen.

## Requirements

- Node.js 22+ and npm
- Rust stable, for the Tauri shell
- `ffmpeg` and `ffprobe` sidecars under `src-tauri/binaries/` (git-ignored)

## Development

```sh
npm install
npm run tauri dev
```

## Checks

```sh
npm run lint
npm run typecheck
npm test
cd src-tauri && cargo test && cargo clippy --all-targets -- -D warnings
```

## Known limitations

- Video and audio directories are selected independently. Files are paired by file-name stem;
  a label after a separator (`Ep1 [L].m4a`) is accepted.
- Playback state is not persisted between runs.

## TODO

- Save previously loaded directories and create library from that
- Track last played video
- Better UI: Animations, transitions, paths
- Treat video-audio pairs as directory and play them as playlist
- Memoize last played time for each video

Created using Tauri + React + TypeScript + Tailwind CSS + daisyUI.

## License

MIT
