use serde::Serialize;
use std::fs;
use std::path::PathBuf;

#[derive(Serialize)]
pub struct SyncPair {
    pub video_path: String,
    pub audio_path: String,
}

/// Get all sync pairs by matching files in two directories by stem name.
/// For each video file (e.g., `movie.mp4`), finds an audio file with the same
/// stem in the audio directory (e.g., `movie.ogg`).
#[tauri::command]
pub fn get_sync_pairs_from_dirs(video_dir: String, audio_dir: String) -> Vec<SyncPair> {
    let v_dir = PathBuf::from(&video_dir);
    let a_dir = PathBuf::from(&audio_dir);

    if !v_dir.is_dir() || !a_dir.is_dir() {
        return Vec::new();
    }

    // Collect audio files keyed by stem for O(1) lookup per video file
    let mut audio_by_stem: std::collections::HashMap<String, PathBuf> =
        std::collections::HashMap::new();

    if let Ok(a_entries) = fs::read_dir(&a_dir) {
        for a_entry in a_entries.filter_map(|e| e.ok()) {
            let a_path = a_entry.path();
            if a_path.is_file() {
                if let Some(stem) = a_path.file_stem().and_then(|s| s.to_str()) {
                    audio_by_stem.insert(stem.to_string(), a_path);
                }
            }
        }
    }

    // Match each video file against the audio map
    let mut pairs = Vec::new();
    if let Ok(v_entries) = fs::read_dir(&v_dir) {
        for v_entry in v_entries.filter_map(|e| e.ok()) {
            let v_path = v_entry.path();
            if let Some(stem) = v_path.file_stem().and_then(|s| s.to_str()) {
                if let Some(audio_path) = audio_by_stem.get(stem) {
                    pairs.push(SyncPair {
                        video_path: v_path.to_string_lossy().into_owned(),
                        audio_path: audio_path.to_string_lossy().into_owned(),
                    });
                }
            }
        }
    }

    pairs
}
