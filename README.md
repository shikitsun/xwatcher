# XWatcher - watch different video / audio at same time

Remux provided video and audio like VLC "play audio with video" functionality, but more handy
Create pairs from video aud audio sources

## TODO

- Save previously loaded directories and create library from that
- Track last played video
- Better UI: Animations, transitions, paths
- Treat video-audio pairs as directory and play them as playlist
- Memoize last played time for each video

## Known limitations

- Up to 2GB files currently supported
- Video and audio sources selectable each individually


## Development

```
npm run tauri dev
```

Created using Tauri + react + typescript + tailwindCSS + daisyUI
