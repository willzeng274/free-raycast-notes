use std::sync::Arc;

use tauri::{Emitter, Manager, Runtime, WebviewWindow, PhysicalPosition};
use tauri_nspanel::{
    tauri_panel, CollectionBehavior, Panel, PanelLevel, StyleMask, TrackingAreaOptions, WebviewWindowExt as PanelWebviewWindowExt
};
use thiserror::Error;

type TauriError = tauri::Error;

tauri_panel! {
    panel!(RaycastPanel {
        config: {
            canBecomeKeyWindow: true,
            canBecomeMainWindow: false,
            isFloatingPanel: true
        }
        with: {
            tracking_area: {
                options: TrackingAreaOptions::new()
                    .active_always()
                    .mouse_entered_and_exited()
                    .mouse_moved()
                    .cursor_update(),
                auto_resize: true
            }
        }
    })

    panel_event!(RaycastPanelEventHandler {
        windowDidBecomeKey(notification: &NSNotification) -> (),
        windowDidResignKey(notification: &NSNotification) -> ()
    })
}

#[derive(Error, Debug)]
enum Error {
    #[error("Unable to convert window to panel")]
    Panel,
}

pub trait WebviewWindowExt {
    fn to_raycast_panel(&self) -> tauri::Result<Arc<dyn Panel>>;

    fn center_at_cursor_monitor(&self) -> tauri::Result<()>;
}

impl<R: Runtime> WebviewWindowExt for WebviewWindow<R> {
    fn to_raycast_panel(&self) -> tauri::Result<Arc<dyn Panel>> {
        let panel = self
            .to_panel::<RaycastPanel>()
            .map_err(|_| TauriError::Anyhow(Error::Panel.into()))?;

        panel.set_level(PanelLevel::Floating.value());

        panel.set_collection_behavior(
            CollectionBehavior::new()
                .full_screen_auxiliary()
                .can_join_all_spaces() // i think this means other desktops?
                .into()
        );

        panel.set_style_mask(StyleMask::empty().nonactivating_panel().resizable().into());

        let handler = RaycastPanelEventHandler::new();
      
        let handle1 = self.app_handle().clone();
        let label1 = self.label().to_string();
      
        handler.window_did_become_key(move |_notification| {
            let _ = handle1.emit(format!("{}_panel_did_become_key", label1).as_str(), ());
        });

        let handle2 = self.app_handle().clone();
        let label2 = self.label().to_string();
      
        handler.window_did_resign_key(move |_notification| {
            let _ = handle2.emit(format!("{}_panel_did_resign_key", label2).as_str(), ());
        });

        panel.set_event_handler(Some(handler.as_protocol_object()));

        Ok(panel)
    }

    fn center_at_cursor_monitor(&self) -> tauri::Result<()> {
        let cursor = self.cursor_position()?;
        if let Some(m) = self.app_handle().monitor_from_point(cursor.x as f64, cursor.y as f64)? {
            let win_size = self.outer_size()?;
            let x = m.position().x + ((m.size().width as i32  - win_size.width as i32) / 2);
            let y = m.position().y + ((m.size().height as i32 - win_size.height as i32) / 2);
            self.set_position(PhysicalPosition::new(x, y))?;
        }

        Ok(())
    }
}