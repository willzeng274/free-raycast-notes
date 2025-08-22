import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export function useScreenSharingVisibility() {
    const [isVisible, setIsVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    // Get initial screen sharing visibility state
    useEffect(() => {
        const getInitialState = async () => {
            try {
                const visible = await invoke<boolean>('get_screen_sharing_visibility');
                setIsVisible(visible);
            } catch (error) {
                console.error('Failed to get screen sharing visibility:', error);
                setIsVisible(true); // Default to visible on error
            } finally {
                setIsLoading(false);
            }
        };
        getInitialState();
    }, []);

    const toggleVisibility = async () => {
        try {
            const newVisibility = !isVisible;
            await invoke('set_screen_sharing_visibility', { visible: newVisibility });
            setIsVisible(newVisibility);
            return newVisibility;
        } catch (error) {
            console.error('Failed to toggle screen sharing visibility:', error);
            throw error;
        }
    };

    return {
        isVisible,
        isLoading,
        toggleVisibility
    };
}
