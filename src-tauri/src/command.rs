use tauri::{AppHandle, Manager};
use tauri_nspanel::ManagerExt;

#[cfg(target_os = "macos")]
use tauri_nspanel::{
    objc2,
    objc2_app_kit::{NSWindow, NSWindowSharingType},
};

use crate::RAYCAST_LABEL;

#[tauri::command]
pub fn show_panel(handle: AppHandle) {
  let panel = handle.get_webview_panel(RAYCAST_LABEL).unwrap();

  panel.show();
}

#[tauri::command]
pub fn hide_panel(handle: AppHandle) {
  let panel = handle.get_webview_panel(RAYCAST_LABEL).unwrap();

  panel.hide();
}

#[tauri::command]
pub fn close_panel(handle: AppHandle) {
  let panel = handle.get_webview_panel(RAYCAST_LABEL).unwrap();

  panel.set_released_when_closed(true);

  panel.close(&handle);
}

#[tauri::command]
pub fn quit_app(handle: AppHandle) {
  handle.exit(0);
}

#[tauri::command]
pub fn set_screen_sharing_visibility(handle: AppHandle, visible: bool) -> Result<(), String> {
  #[cfg(target_os = "macos")]
  {
    let window = handle.get_webview_window(RAYCAST_LABEL)
      .ok_or("Failed to get window")?;
    
    if let Ok(ns_window) = window.ns_window() {
      unsafe {
        let ns_window_cvoid = ns_window as *const std::ffi::c_void;
        let ns_window: &NSWindow = &*(ns_window_cvoid as *const NSWindow);
        let sharing_type = if visible { 
          NSWindowSharingType::ReadOnly
        } else {
          NSWindowSharingType::None
        };
        let _: () = objc2::msg_send![ns_window, setSharingType: sharing_type];
      }
      Ok(())
    } else {
      Err("Failed to get NSWindow".to_string())
    }
  }
  
  #[cfg(not(target_os = "macos"))]
  {
    let _ = (handle, visible);
    Err("Screen sharing visibility is only supported on macOS".to_string())
  }
}

#[tauri::command]
pub fn get_screen_sharing_visibility(handle: AppHandle) -> Result<bool, String> {
  #[cfg(target_os = "macos")]
  {
    let window = handle.get_webview_window(RAYCAST_LABEL)
      .ok_or("Failed to get window")?;
    
    if let Ok(ns_window) = window.ns_window() {
      unsafe {
        let ns_window_cvoid = ns_window as *const std::ffi::c_void;
        let ns_window: &NSWindow = &*(ns_window_cvoid as *const NSWindow);
        let sharing_type: NSWindowSharingType = objc2::msg_send![ns_window, sharingType];
        Ok(sharing_type != NSWindowSharingType::None)
      }
    } else {
      Err("Failed to get NSWindow".to_string())
    }
  }
  
  #[cfg(not(target_os = "macos"))]
  {
    let _ = handle;
    Ok(true)
  }
}