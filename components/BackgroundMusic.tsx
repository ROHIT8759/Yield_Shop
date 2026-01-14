'use client';

import { useEffect, useRef } from 'react';

export default function BackgroundMusic() {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Create audio element
        audioRef.current = new Audio('/groovy-vibe-427121.mp3');
        audioRef.current.loop = true; // Auto-restart when finished
        audioRef.current.volume = 0.05; // Set volume to 5%
        audioRef.current.autoplay = true; // Enable autoplay attribute

        // Add event listener to ensure restart if loop fails
        const handleEnded = () => {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => console.log('Restart failed'));
            }
        };

        audioRef.current.addEventListener('ended', handleEnded);

        // Attempt to play automatically on page load
        const playAudio = async () => {
            try {
                if (audioRef.current) {
                    await audioRef.current.play();
                }
            } catch (error) {
                console.log('Autoplay blocked by browser, waiting for user interaction');
                // Try to play on any user interaction
                const startOnInteraction = () => {
                    if (audioRef.current) {
                        audioRef.current.play()
                            .catch(() => console.log('Failed to start music'));
                    }
                };

                document.addEventListener('click', startOnInteraction, { once: true });
                document.addEventListener('keydown', startOnInteraction, { once: true });
                document.addEventListener('touchstart', startOnInteraction, { once: true });
            }
        };

        playAudio();

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('ended', handleEnded);
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    return null; // No UI, just background music
}
