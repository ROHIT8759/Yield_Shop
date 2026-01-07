'use client';

import { useEffect, useRef } from 'react';

export default function SoundManager() {
    const audioContextRef = useRef<AudioContext | null>(null);
    const droneOscillatorsRef = useRef<OscillatorNode[]>([]);
    const droneGainNodeRef = useRef<GainNode | null>(null);
    const hasStartedRef = useRef(false);

    // Initialize & Auto-start logic
    useEffect(() => {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioContextRef.current = new AudioContext();
        }

        const startAudio = async () => {
            if (hasStartedRef.current || !audioContextRef.current) return;

            try {
                if (audioContextRef.current.state === 'suspended') {
                    await audioContextRef.current.resume();
                }
                startDrone();
                hasStartedRef.current = true;

                // Remove listeners once started
                ['click', 'keydown', 'touchstart'].forEach(event =>
                    window.removeEventListener(event, startAudio)
                );
            } catch (e) {
                console.error("Audio start failed", e);
            }
        };

        // Add listeners for "first interaction" autoplay pattern
        // This makes it behave like a game - waits for first input then "starts"
        ['click', 'keydown', 'touchstart'].forEach(event =>
            window.addEventListener(event, startAudio)
        );

        // Global Click Listener for UI Sounds (remains active)
        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Play sound for buttons, links, or elements with role="button"
            const clickable = target.closest('button, a, [role="button"], input[type="submit"], input[type="button"]');

            if (clickable) {
                playClickSound();
            }
        };

        window.addEventListener('click', handleGlobalClick);

        return () => {
            ['click', 'keydown', 'touchstart'].forEach(event =>
                window.removeEventListener(event, startAudio)
            );
            window.removeEventListener('click', handleGlobalClick);
            stopDrone();
        };
    }, []);

    // Ambient Drone Generator (Ethereal Space Sound)
    const startDrone = () => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;

        // Stop any existing drone to prevent layering
        stopDrone();

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 4); // Slow fade in
        masterGain.connect(ctx.destination);
        droneGainNodeRef.current = masterGain;

        // Create 3 oscillators for a chord (Root, Fifth, Octave)
        const freqs = [110, 164.81, 220]; // A2, E3, A3 (A Majorish space drone)

        freqs.forEach(freq => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            // Add slight detune for "shimmer"
            const detune = Math.random() * 4 - 2;
            osc.detune.setValueAtTime(detune, ctx.currentTime);

            // Per-oscillator LFO for movement
            const lfo = ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.1, ctx.currentTime); // Slow breathing

            const lfoGain = ctx.createGain();
            lfoGain.gain.setValueAtTime(5, ctx.currentTime); // Frequency modulation depth

            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start();

            osc.connect(masterGain);
            osc.start();
            droneOscillatorsRef.current.push(osc);
            droneOscillatorsRef.current.push(lfo); // Keep track to stop later
        });
    };

    const stopDrone = () => {
        if (droneGainNodeRef.current && audioContextRef.current) {
            const ctx = audioContextRef.current;
            // Fade out
            try {
                droneGainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
            } catch (e) {
                // Context might be closed
            }
        }

        setTimeout(() => {
            droneOscillatorsRef.current.forEach(osc => {
                try { osc.stop(); } catch (e) { }
            });
            droneOscillatorsRef.current = [];
        }, 1000);
    };

    // Synthesize Click Sound (Sci-fi Blip)
    const playClickSound = () => {
        if (!audioContextRef.current) return;

        const ctx = audioContextRef.current;
        // Resume if suspended (browser policy)
        if (ctx.state === 'suspended') ctx.resume();

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Sound Design: High tech blip
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.05, ctx.currentTime); // Lower volume for clicks
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.1);
    };

    return null; // Invisible component
}
