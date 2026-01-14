'use client';

import { useEffect, useRef } from 'react';

export default function BackgroundMusic() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const hasStartedRef = useRef(false);

    useEffect(() => {
        // Create audio element
        const audio = new Audio('/groovy-vibe-427121.mp3');
        audio.loop = true;
        audio.volume = 0.05;
        audio.autoplay = true;
        audioRef.current = audio;

        // Function to start audio
        const startAudio = async () => {
            if (hasStartedRef.current || !audioRef.current) return;

            try {
                await audioRef.current.play();
                hasStartedRef.current = true;
                console.log('✅ Music is playing!');

                // Remove all listeners after successful start
                removeAllListeners();
            } catch (error) {
                // Autoplay failed, keep listeners active
            }
        };

        // All possible interaction events
        const events = ['click', 'touchstart', 'touchend', 'mousedown', 'keydown', 'scroll', 'mousemove'];

        const removeAllListeners = () => {
            events.forEach(eventName => {
                document.removeEventListener(eventName, startAudio);
            });
        };

        // Try to play immediately on load
        startAudio();

        // Add interaction listeners as fallback
        events.forEach(eventName => {
            document.addEventListener(eventName, startAudio, { passive: true, capture: true, once: true });
        });

        return () => {
            removeAllListeners();
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    return null;
}
