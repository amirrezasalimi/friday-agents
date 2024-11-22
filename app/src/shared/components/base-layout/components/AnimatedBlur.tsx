'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Color {
    r: number;
    g: number;
    b: number;
}

const interpolateColor = (color1: Color, color2: Color, progress: number): Color => ({
    r: color1.r + (color2.r - color1.r) * progress,
    g: color1.g + (color2.g - color1.g) * progress,
    b: color1.b + (color2.b - color1.b) * progress,
});

const colorToRgba = (color: Color, alpha: number = 0.1): string =>
    `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${alpha})`;

export const AnimatedBlur = () => {
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        
        const updateMousePosition = (e: MouseEvent) => {
            mouseX.set(e.clientX / window.innerWidth);
            mouseY.set(e.clientY / window.innerHeight);
        };

        window.addEventListener('mousemove', updateMousePosition);
        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('resize', updateDimensions);
        }
    }, []);

    const springConfig = { damping: 25, stiffness: 150 };
    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);

    const colors = {
        start: { r: 147, g: 197, b: 253 },
        middle: { r: 167, g: 139, b: 250 },
        end: { r: 251, g: 146, b: 60 },
    };

    const gradient = useTransform(
        [x, y],
        (latest: number[]) => {
            const xRatio = latest[0];
            const yRatio = latest[1];
            const diagonalRatio = xRatio * yRatio;

            const startColor = interpolateColor(colors.start, colors.end, xRatio);
            const middleColor = interpolateColor(colors.middle, colors.start, yRatio);
            const endColor = interpolateColor(colors.end, colors.middle, diagonalRatio);

            return `radial-gradient(circle at center, 
        ${colorToRgba(startColor)} 0%, 
        ${colorToRgba(middleColor)} 50%, 
        ${colorToRgba(endColor)} 100%
      )`;
        }
    );

    const translateX = useTransform(x, (latest) => (latest - 0.5) * dimensions.width);
    const translateY = useTransform(y, (latest) => (latest - 0.5) * dimensions.height);

    return (
        <motion.div
            className="blur-[115px] rounded-full size-[500px] absolute pointer-events-none"
            style={{
                background: gradient,
                x: translateX,
                y: translateY,
            }}
        />
    );
};
