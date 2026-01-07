'use client';

import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    originX: number;
    originY: number;
    size: number;
    color: string;
    vx: number;
    vy: number;
    force: number;
    angle: number;
    distance: number;
    friction: number;
    ease: number;
}

export default function InteractiveStars() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: 0, y: 0, radius: 100 });
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Handle mouse
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current.x = e.x;
            mouseRef.current.y = e.y;
        };

        const initParticles = () => {
            particlesRef.current = [];

            // 1. Draw Text to get positions
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Responsive font size
            const fontSize = Math.min(canvas.width / 6, 150);
            ctx.font = `900 ${fontSize}px sans-serif`;
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Draw text centered
            // We use two lines "Yield" and "Shop."
            const lineHeight = fontSize * 1.1;
            ctx.fillText('Yield', canvas.width / 2, canvas.height / 2 - lineHeight / 2 + 20);
            ctx.fillText('Shop.', canvas.width / 2, canvas.height / 2 + lineHeight / 2 + 20);

            // Get pixel data
            const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // 2. Create Particles from text pixels
            // Scan with a gap to control density
            const gap = 5;
            const particles: Particle[] = [];

            for (let y = 0; y < textCoordinates.height; y += gap) {
                for (let x = 0; x < textCoordinates.width; x += gap) {
                    // Check alpha value (every 4th value in the array is alpha)
                    const index = (y * textCoordinates.width + x) * 4 + 3;
                    if (textCoordinates.data[index] > 128) {
                        // Found a pixel!
                        const pX = x;
                        const pY = y;
                        particles.push({
                            x: Math.random() * canvas.width, // Start random
                            y: Math.random() * canvas.height,
                            originX: pX,
                            originY: pY,
                            color: 'white',
                            size: Math.random() * 2 + 1,
                            vx: 0,
                            vy: 0,
                            force: 0,
                            angle: 0,
                            distance: 0,
                            friction: Math.random() * 0.6 + 0.15,
                            ease: Math.random() * 0.1 + 0.05
                        });
                    }
                }
            }

            // 3. Add random background stars
            const bgStarCount = Math.floor((canvas.width * canvas.height) / 5000);
            for (let i = 0; i < bgStarCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    originX: Math.random() * canvas.width, // Bg stars wander
                    originY: Math.random() * canvas.height,
                    color: `rgba(255, 255, 255, ${Math.random() * 0.5})`,
                    size: Math.random() * 1.5,
                    vx: (Math.random() - 0.5) * 0.5, // Constant drift velocity
                    vy: (Math.random() - 0.5) * 0.5,
                    force: 0,
                    angle: 0,
                    distance: 0,
                    friction: 0.9,
                    ease: 0.01
                });
            }

            particlesRef.current = particles;
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const mouse = mouseRef.current;

            // Update and draw particles
            for (let i = 0; i < particlesRef.current.length; i++) {
                const p = particlesRef.current[i];

                // --- Text Particle Logic ---
                // Calculate distance to mouse
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Mouse repulsion interaction
                const forceDistance = 10000; // Interaction radius squared somewhat
                // Using distance directly for simple repulsion checking
                const interactionRadius = 150;

                if (dist < interactionRadius) {
                    const forceDirectionX = dx / dist;
                    const forceDirectionY = dy / dist;
                    const force = (interactionRadius - dist) / interactionRadius;
                    const directionX = forceDirectionX * force * 50; // Strength
                    const directionY = forceDirectionY * force * 50;

                    p.vx -= directionX * 0.5;
                    p.vy -= directionY * 0.5;
                }

                // If particle is a Text Particle (implied by having fixed origin match)
                // Actually to differentiate easily, maybe check if it moves? 
                // Bg stars have constant vx/vy usually, but here we update vx/vy every frame for text logic.
                // Let's rely on ease: Text particles 'home', bg stars 'drift'.

                // Let's assume friction > 0.8 is typical for "loose" background stars (simpler logic: we didn't add a flag)
                // Better approach: Check if it has 'homing' behavior.
                // Text particles have specific originX/Y that maps to text. BG stars origin is random?
                // Actually, let's treat them slightly differently based on friction/ease setup:

                // Homing logic (Go to origin)
                // (Only applies if we want them to form shape)
                // We initialized BG stars with friction 0.9, ease 0.01, but they also have constant drift.

                // Let's split behavior based on an implied property (or just add one to interface? Too late, let's use logic).
                // Actually, I can just apply homing to ALL, but for bg stars, we move their origin?
                // No, let's just make the text particles behave nicely.

                // Physics Update
                p.vx *= p.friction;
                p.vy *= p.friction;

                // Homing Force (pull back to origin)
                const homeDx = p.originX - p.x;
                const homeDy = p.originY - p.y;

                // If it is a text particle (ease > 0.02 usually), pull strong.
                // Background star (ease 0.01) pull weak?
                // Actually, for background stars, let's just let them drift and wrap.

                // Hack: Use `color` to distinguish 'white' (text) vs 'rgba...' (bg)
                if (p.color === 'white') {
                    // Text Particle
                    p.vx += homeDx * p.ease;
                    p.vy += homeDy * p.ease;

                    // Add continuous subtle movement (shimmer)
                    p.x += (Math.random() - 0.5) * 0.5;
                    p.y += (Math.random() - 0.5) * 0.5;
                } else {
                    // Background Star
                    // Constant drift (stored in vx/vy initially but friction eats it unless applied)
                    // Re-apply drift
                    p.x += (Math.random() - 0.5) * 0.5; // Slight randomness
                    p.y += (Math.random() - 0.5) * 0.5;

                    // Keep them moving
                    if (Math.abs(p.vx) < 0.1) p.vx += (Math.random() - 0.5) * 0.05;
                    if (Math.abs(p.vy) < 0.1) p.vy += (Math.random() - 0.5) * 0.05;

                    // Screen wrap
                    if (p.x < 0) p.x = canvas.width;
                    if (p.x > canvas.width) p.x = 0;
                    if (p.y < 0) p.y = canvas.height;
                    if (p.y > canvas.height) p.y = 0;
                }

                p.x += p.vx;
                p.y += p.vy;

                // Draw
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);

        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
        // Ensure transparent background
        />
    );
}
