use std::{
    fs,
    hash::{Hash, Hasher},
};

use tauri::{AppHandle, Manager};
use tauri_plugin_shell::ShellExt;

#[tauri::command]
pub async fn create_remux(
    app: AppHandle,
    video_url: String,
    audio_url: String,
) -> Result<String, String> {
    let cache_dir = app
        .path()
        .app_cache_dir()
        .map_err(|e| e.to_string())?
        .join("remuxes");

    fs::create_dir_all(&cache_dir).map_err(|e| e.to_string())?;

    let mut hasher = std::collections::hash_map::DefaultHasher::new();
    video_url.hash(&mut hasher);
    let output_path = cache_dir.join(format!("{:016x}.mp4", hasher.finish()));

    if output_path.exists() {
        return Ok(output_path.to_string_lossy().into_owned());
    }

    let output_arg = output_path
        .to_str()
        .ok_or_else(|| "Invalid output path".to_string())?
        .to_owned();

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
            "-c",
            "copy",
            "-shortest",
            "-movflags",
            "+faststart",
            &output_arg,
        ])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !result.status.success() {
        let error = String::from_utf8_lossy(&result.stderr);
        return Err(format!("FFmpeg failed: {error}"));
    }

    if !output_path.exists() {
        return Err("FFmpeg did not create a thumbnail".to_string());
    }

    Ok(output_path.to_string_lossy().into_owned())
}

#[tauri::command]
pub async fn clear_remux(app: AppHandle, video_url: String) -> Result<(), String> {
    let cache_dir = app
        .path()
        .app_cache_dir()
        .map_err(|e| e.to_string())?
        .join("remuxes");

    let mut hasher = std::collections::hash_map::DefaultHasher::new();
    video_url.hash(&mut hasher);
    let output_path = cache_dir.join(format!("{:016x}.mp4", hasher.finish()));

    if output_path.exists() {
        fs::remove_file(output_path).map_err(|_| "Invalid remove file")?;
        return Ok(());
    }

    return Ok(());
}
