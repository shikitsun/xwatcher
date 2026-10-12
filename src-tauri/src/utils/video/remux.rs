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

#[tauri::command]
pub async fn create_remux(
    app: AppHandle,
    state: State<'_, MuxJobs>,
    video_url: String,
    audio_url: String,
    on_chunk: Channel<InvokeResponseBody>,
) -> Result<(), String> {
    let result = app
        .shell()
        .sidecar("ffmpeg")
        .map_err(|e| e.to_string())?
        .args([
            "-y",
            "-nostdin",
            "-i",
            &video_url,
            "-i",
            &audio_url,
            "-map",
            "0:v:0",
            "-map",
            "1:a:0",
            "-c:v",
            "libx264",
            "-c:a",
            "aac",
            "-shortest",
            "-movflags",
            "frag_keyframe+empty_moov+default_base_moof",
            "-f",
            "mp4",
            "pipe:1",
        ])
        .set_raw_out(true)
        .spawn()
        .map_err(|e| e.to_string())?;

    let (mut rx, child) = result;

    state
        .0
        .lock()
        .map_err(|e| e.to_string())?
        .insert(video_url.clone(), child);

    // let encoding = Encoding::for_label(b"latin2").unwrap();
    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(line) => {
                // let (decoded, _, _) = encoding.decode(&line);
                // println!("got: {decoded}");
                on_chunk
                    .send(InvokeResponseBody::Raw(line.to_vec()))
                    .map_err(|e| e.to_string())?;
            }
            _ => {}
        }
    }

    state
        .0
        .lock()
        .map_err(|e| e.to_string())?
        .remove(&video_url);

    Ok(())
}

#[tauri::command]
pub async fn clear_remux(
    app: AppHandle,
    state: State<'_, MuxJobs>,
    video_url: String,
) -> Result<(), String> {
    // let cache_dir = app
    //     .path()
    //     .app_cache_dir()
    //     .map_err(|e| e.to_string())?
    //     .join("remuxes");

    // let mut hasher = std::collections::hash_map::DefaultHasher::new();
    // video_url.hash(&mut hasher);
    // let output_path = cache_dir.join(format!("{:016x}.mp4", hasher.finish()));

    // if output_path.exists() {
    //     fs::remove_file(output_path).map_err(|_| "Invalid remove file")?;
    //     return Ok(());
    // }

    let child = state
        .0
        .lock()
        .map_err(|e| e.to_string())?
        .remove(&video_url);

    if let Some(child) = child {
        child.kill().map_err(|e| e.to_string())?;
    }

    return Ok(());
}
