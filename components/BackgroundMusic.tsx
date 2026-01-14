'use client';

import { useEffect, useRef } from 'react';

export default function BackgroundMusic() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const hasStartedRef = useRef(false);

    useEffect(() => {
        // Create audio element
        const audio = new Audio('/groovy-vibe-427121.mp3');
        audio.loop = true;
        audio.volume = 0.03; // Very low volume for background ambiance
        audioRef.current = audio;

        // Function to start audio
        const startAudio = async () => {
            if (hasStartedRef.current || !audioRef.current) return;

            try {
                await audioRef.current.play();
                hasStartedRef.current = true;
                console.log('🎵 Music started playing!');
            } catch (error) {
                console.log('⏸️ Autoplay blocked - will start on first interaction');
            }
        };

        // User interaction handler
        const handleInteraction = () => {
            if (!hasStartedRef.current) {
                startAudio();
            }
        };

        // Add minimal interaction listeners
        const events = ['click', 'touchstart', 'touchend', 'mousedown', 'keydown', 'scroll', 'mousemove'];
        events.forEach(event => {
            document.addEventListener(event, handleInteraction, { once: true });
        });

        // Try to play immediately on mount
        startAudio();

        // Retry after short delays (some browsers allow after brief moment)
        const retryTimeout1 = setTimeout(startAudio, 100);
        const retryTimeout2 = setTimeout(startAudio, 500);
        const retryTimeout3 = setTimeout(startAudio, 1000);

        return () => {
            clearTimeout(retryTimeout1);
            clearTimeout(retryTimeout2);
            clearTimeout(retryTimeout3);
            events.forEach(event => {
                document.removeEventListener(event, handleInteraction);
            });
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    return null;
}
