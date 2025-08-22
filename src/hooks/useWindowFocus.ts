import { useState, useEffect } from 'react';

export function useWindowFocus() {
    const [isWindowFocused, setIsWindowFocused] = useState(true);

    useEffect(() => {
        // Set initial focus state
        setIsWindowFocused(document.hasFocus());

        const handleFocus = () => {
            setIsWindowFocused(true);
        };

        const handleBlur = () => {
            setIsWindowFocused(false);
        };

        // Listen to window focus/blur events
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        // Also listen to document visibility changes as a fallback
        const handleVisibilityChange = () => {
            setIsWindowFocused(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return isWindowFocused;
}
