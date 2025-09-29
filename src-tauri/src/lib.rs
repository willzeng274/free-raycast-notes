#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use tauri_nspanel::ManagerExt;
use window::WebviewWindowExt;

mod command;
mod window;

const RAYCAST_LABEL: &str = "main";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // for opening URLs (anchor tags with href links)
        // .plugin(tauri_plugin_opener::init())
        // .invoke_handler(tauri::generate_handler![greet])

        .invoke_handler(tauri::generate_handler![
            command::show_panel,
            command::hide_panel,
            command::close_panel,
            command::quit_app,
            command::set_screen_sharing_visibility,
            command::get_screen_sharing_visibility,
            command::take_screenshot
        ])
        .plugin(tauri_nspanel::init())
        .setup(move |app| {
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            let handle = app.app_handle();

            let window = handle.get_webview_window(RAYCAST_LABEL).unwrap();

            window.to_raycast_panel()?;

            let panel = handle.get_webview_panel(RAYCAST_LABEL).unwrap();
            window.center_at_cursor_monitor().unwrap();
            panel.show();

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app: &tauri::AppHandle, event: tauri::RunEvent| match event {
            tauri::RunEvent::Reopen { has_visible_windows, .. } => {
                if !has_visible_windows {
                    if let Ok(panel) = app.get_webview_panel(RAYCAST_LABEL) {
                        panel.show();
                    }
                }
            }
            _ => {}
        });
}