use std::{collections::HashMap, sync::Mutex};

use tauri::{
    ipc::{Channel, InvokeResponseBody},
    AppHandle, State,
};
use tauri_plugin_shell::{
    process::{CommandChild, CommandEvent},
    ShellExt,
};

#[derive(Default)]
pub struct MuxJobs(Mutex<HashMap<String, CommandChild>>);

/// Starts an ffmpeg process that remuxes `video_url` + `audio_url` into an
/// MP4 stream and pushes raw stdout chunks through `on_chunk`.
///
/// `start_offset` (seconds) optionally seeks the input to that playback
/// timestamp *before* decoding (`-ss` placed ahead of `-i`), which lets the
/// frontend fetch chunks around an arbitrary seek position. Absent / `0` means
/// "start from the beginning". Backward compatible.
#[tauri::command]
pub async fn create_remux(
    app: AppHandle,
    state: State<'_, MuxJobs>,
    video_url: String,
    audio_url: String,
    on_chunk: Channel<InvokeResponseBody>,
    start_offset: Option<f64>,
) -> Result<(), String> {
    let mut args: Vec<String> = vec!["-y".to_string(), "-nostdin".to_string()];

    // Input seeking: `-ss` must precede `-i` so ffmpeg seeks the input to the
    // requested timestamp and resets output PTS to start at 0 from there.
    if let Some(offset) = start_offset {
        if offset > 0.0 {
            args.push("-ss".to_string());
            args.push(offset.to_string());
        }
    }

    args.extend([
        "-i".to_string(),
        video_url.clone(),
        "-i".to_string(),
        audio_url,
        "-map".to_string(),
        "0:v:0".to_string(),
        "-map".to_string(),
        "1:a:0".to_string(),
        "-c:v".to_string(),
        "libx264".to_string(),
        "-c:a".to_string(),
        "aac".to_string(),
        "-shortest".to_string(),
        "-movflags".to_string(),
        "frag_keyframe+empty_moov+default_base_moof".to_string(),
        "-f".to_string(),
        "mp4".to_string(),
        "pipe:1".to_string(),
    ]);

    let result = app
        .shell()
        .sidecar("ffmpeg")
        .map_err(|e| e.to_string())?
        .args(args)
        .set_raw_out(true)
        .spawn()
        .map_err(|e| e.to_string())?;

    let (mut rx, child) = result;

    state
        .0
        .lock()
        .map_err(|e| e.to_string())?
        .insert(video_url.clone(), child);

    while let Some(event) = rx.recv().await {
        if let CommandEvent::Stdout(line) = event {
            on_chunk
                .send(InvokeResponseBody::Raw(line.to_vec()))
                .map_err(|e| e.to_string())?;
        }
    }

    state
        .0
        .lock()
        .map_err(|e| e.to_string())?
        .remove(&video_url);

    Ok(())
}

/// Probe the container duration of `video_url`.
///
/// ffprobe is resolved by tauri-plugin-shell's `sidecar()` relative to the
/// tauri executable directory (not PATH), so the `ffprobe` sidecar must sit
/// next to the tauri executable (declared in `tauri.conf.json` `externalBin`).
/// ffprobe is the proper duration tool and does not decode the whole file.
#[tauri::command]
pub async fn probe_video_duration(app: AppHandle, video_url: String) -> Result<f64, String> {
    let result = app
        .shell()
        .sidecar("ffprobe")
        .map_err(|e| e.to_string())?
        .args([
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1",
            &video_url,
        ])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !result.status.success() {
        let error = String::from_utf8_lossy(&result.stderr);
        return Err(format!("FFprobe duration probe failed: {error}"));
    }

    let output = String::from_utf8_lossy(&result.stdout);
    let trimmed = output.trim();
    // ffprobe -show_entries format=duration -of default=noprint_wrappers=1
    // prints a single line: `duration=123.456`
    let duration = trimmed
        .split_once('=')
        .map(|(_, value)| value.trim())
        .and_then(|value| value.parse::<f64>().ok())
        .ok_or_else(|| format!("Invalid ffprobe duration output: {trimmed}"))?;

    Ok(duration)
}

#[tauri::command]
pub async fn clear_remux(state: State<'_, MuxJobs>, video_url: String) -> Result<(), String> {
    let child = state
        .0
        .lock()
        .map_err(|e| e.to_string())?
        .remove(&video_url);

    if let Some(child) = child {
        child.kill().map_err(|e| e.to_string())?;
    }

    Ok(())
}
