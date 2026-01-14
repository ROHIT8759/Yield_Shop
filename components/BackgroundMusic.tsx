'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function BackgroundMusic() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        // Create audio element
        audioRef.current = new Audio('/groovy-vibe-427121.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3; // Set volume to 30%

        // Attempt to play automatically (might be blocked by browser policy)
        const playAudio = async () => {
            try {
                if (audioRef.current) {
                    await audioRef.current.play();
                    setIsPlaying(true);
                }
            } catch {
                console.log('Autoplay blocked, waiting for user interaction');
            }
        };

        playAudio();

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
        setHasInteracted(true);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={togglePlay}
                className="bg-sol-card/80 backdrop-blur-md border border-sol-primary/30 p-3 rounded-full text-sol-primary hover:bg-sol-primary hover:text-white transition-all duration-300 shadow-lg group"
                title={isPlaying ? "Pause Music" : "Play Music"}
            >
                {isPlaying ? (
                    <Volume2 className="h-6 w-6 animate-pulse" />
                ) : (
                    <VolumeX className="h-6 w-6" />
                )}

                {/* Tooltip for first-time users if autoplay was blocked */}
                {!hasInteracted && !isPlaying && (
                    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-sol-primary text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to play music
                    </span>
                )}
            </button>
        </div>
    );
}
