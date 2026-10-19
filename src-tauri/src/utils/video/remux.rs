use std::{
    collections::HashMap,
    sync::{
        atomic::{AtomicU64, Ordering},
        Mutex,
    },
};

use tauri::{
    ipc::{Channel, InvokeResponseBody},
    AppHandle, State,
};
use tauri_plugin_shell::{
    process::{CommandChild, CommandEvent},
    ShellExt,
};

/// Identifier of ffmpeg job. Need for cancel previous run correctly
static NEXT_JOB_ID: AtomicU64 = AtomicU64::new(1);

pub struct MuxJob {
    id: u64,
    child: CommandChild,
}

#[derive(Default)]
pub struct MuxJobs(Mutex<HashMap<String, MuxJob>>);

/// Starts an ffmpeg process that remuxes `video_url` + `audio_url` into an
/// MP4 stream and pushes raw stdout chunks through `on_chunk`.
///
/// `start_offset` (seconds) seeks both inputs to that playback timestamp
/// *before* decoding (`-ss` placed ahead of each `-i`), which lets the
/// frontend fetch chunks around an arbitrary playback position. ffmpeg resets
/// output PTS to 0 after an input seek, so the frontend places the fragment
/// in the MediaSource timeline with `timestampOffset`.
///
/// `chunk_length` (seconds) limits the produced chunk; ffmpeg stops earlier
/// when the input ends.
#[tauri::command]
pub async fn create_remux(
    app: AppHandle,
    state: State<'_, MuxJobs>,
    video_url: String,
    audio_url: String,
    on_chunk: Channel<InvokeResponseBody>,
    start_offset: Option<f64>,
    chunk_length: Option<f64>,
) -> Result<(), String> {
    let start = start_offset.unwrap_or(0.0).max(0.0);
    let length = chunk_length.unwrap_or(60.0).clamp(1.0, 3600.0);
    let job_id = NEXT_JOB_ID.fetch_add(1, Ordering::Relaxed);

    // Try drop any previous job if any
    clear_remux(state.clone(), video_url.clone()).await?;

    let args = remux_args(start, length, &video_url, &audio_url);

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
        .insert(video_url.clone(), MuxJob { id: job_id, child });

    let mut failure: Option<String> = None;

    while let Some(event) = rx.recv().await {
        if let CommandEvent::Stdout(line) = event {
            if let Err(error) = on_chunk.send(InvokeResponseBody::Raw(line.to_vec())) {
                failure = Some(error.to_string());
                break;
            }
        }
    }

    // Remove only our own job: `clear_remux` may have already dropped it and
    // a new job with the same `video_url` may have taken its place. Removing
    // by key alone used to kill the new job's bookkeeping and leave its
    // ffmpeg process unstoppable.
    let job = {
        let mut jobs = state.0.lock().map_err(|e| e.to_string())?;
        match jobs.get(&video_url) {
            Some(job) if job.id == job_id => jobs.remove(&video_url),
            _ => None,
        }
    };

    if let Some(job) = job {
        // On normal completion the process has already exited; on a channel
        // error it is still running and must be stopped.
        if failure.is_some() {
            let _ = job.child.kill();
        }
    }

    match failure {
        Some(error) => Err(error),
        None => Ok(()),
    }
}

/// Builds the ffmpeg argument list for one chunk.
fn remux_args(start: f64, length: f64, video_url: &str, audio_url: &str) -> Vec<String> {
    let mut args: Vec<String> = vec!["-y".to_string(), "-nostdin".to_string()];

    // `-ss` applies only to the input that immediately follows it, so it must
    // be repeated for both inputs. Seeking only the video leaves audio at
    // 0:00 while the video starts at the requested offset.
    if start > 0.0 {
        args.push("-ss".to_string());
        args.push(start.to_string());
    }
    args.push("-i".to_string());
    args.push(video_url.to_string());

    if start > 0.0 {
        args.push("-ss".to_string());
        args.push(start.to_string());
    }
    args.push("-i".to_string());
    args.push(audio_url.to_string());

    args.extend([
        "-t".to_string(),
        format!("{length:.3}"),
        "-map".to_string(),
        "0:v:0".to_string(),
        "-map".to_string(),
        "1:a:0".to_string(),
        "-c:v".to_string(),
        "libx264".to_string(),
        // More memory use, faster
        "-preset".to_string(),
        "veryfast".to_string(),
        // handle 60 frames
        "-g".to_string(),
        "60".to_string(),
        "-c:a".to_string(),
        "aac".to_string(),
        "-shortest".to_string(),
        "-movflags".to_string(),
        "frag_keyframe+empty_moov+default_base_moof".to_string(),
        "-f".to_string(),
        "mp4".to_string(),
        "pipe:1".to_string(),
    ]);

    args
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
    let job = state
        .0
        .lock()
        .map_err(|e| e.to_string())?
        .remove(&video_url);

    if let Some(job) = job {
        job.child.kill().map_err(|e| e.to_string())?;
    }

    Ok(())
}
