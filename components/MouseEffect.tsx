'use client';

import { useEffect, useState } from 'react';

export default function MouseEffect() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isMoving, setIsMoving] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setIsMoving(true);

            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIsMoving(false);
            }, 100);
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <>
            {/* Main cursor glow */}
            <div
                className="fixed pointer-events-none z-50 transition-opacity duration-300"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: 'translate(-50%, -50%)',
                    opacity: isMoving ? 1 : 0,
                }}
            >
                <div className="w-8 h-8 bg-sol-primary/30 rounded-full blur-xl animate-pulse"></div>
            </div>

            {/* Larger outer glow */}
            <div
                className="fixed pointer-events-none z-40 transition-all duration-500"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: 'translate(-50%, -50%)',
                    opacity: isMoving ? 0.6 : 0,
                }}
            >
                <div className="w-32 h-32 bg-gradient-radial from-sol-primary/20 via-purple-500/10 to-transparent rounded-full blur-2xl"></div>
            </div>

            {/* Small cursor dot */}
            <div
                className="fixed pointer-events-none z-50 transition-all duration-100"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <div className="w-2 h-2 bg-sol-primary rounded-full border border-white/50"></div>
            </div>
        </>
    );
}
