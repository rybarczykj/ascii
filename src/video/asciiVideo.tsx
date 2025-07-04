import React from 'react';
import { getAsciiFromContext, getGreyscale, getColors, getColoredAsciiFromGreyscale } from '../ascii-utils';

interface ColoredAsciiProps {
    ascii: string;
    colors: string[];
    style: React.CSSProperties;
}

const ColoredAscii: React.FC<ColoredAsciiProps> = ({ ascii, colors, style }) => {
    const lines = ascii.split('\n');
    let colorIndex = 0;

    return (
        <div className="ascii" style={style}>
            {lines.map((line, lineIndex) => (
                <div key={lineIndex}>
                    {line.split('').map((char, charIndex) => {
                        // Find the next non-empty color (skip newline placeholders)
                        let color = 'inherit';
                        while (colorIndex < colors.length && colors[colorIndex] === '') {
                            colorIndex++;
                        }
                        if (colorIndex < colors.length) {
                            color = colors[colorIndex];
                            colorIndex++;
                        }
                        return (
                            <span key={charIndex} style={{ color }}>
                                {char}
                            </span>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

interface StreamingAsciiVideoProps {
    videoElement: HTMLVideoElement | null;
    palette: string | string[];
    asciiResolution: number;
    isColorInverted: boolean;
    contrast: number;
    brightness: number;
    useColors?: boolean;
    frameRate?: number;
    style?: React.CSSProperties;
    aspectRatioMultiplier?: number;
}

export const StreamingAsciiVideo: React.FC<StreamingAsciiVideoProps> = ({
    videoElement,
    palette,
    asciiResolution,
    isColorInverted,
    contrast,
    brightness,
    useColors = false,
    frameRate = 10,
    style,
    aspectRatioMultiplier = 0.6,
}) => {

    const [currentFrame, setCurrentFrame] = React.useState<string | { ascii: string; colors: string[] } | null>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const contextRef = React.useRef<CanvasRenderingContext2D | null>(null);
    const animationFrameRef = React.useRef<number | null>(null);
    const lastFrameTimeRef = React.useRef<number>(0);
    const lastProcessedTimeRef = React.useRef<number>(0);
    const canvasInitializedRef = React.useRef<boolean>(false);

    // Initialize canvas and context once when available
    React.useEffect(() => {
        if (canvasRef.current && !canvasInitializedRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (context) {
                contextRef.current = context;
                canvasInitializedRef.current = true;
            }
        }
    }, []);

    // Process a single frame from the video
    const processFrame = React.useCallback((forceUpdate = false) => {
        try {
            if (!videoElement || !contextRef.current || !canvasRef.current) {
                return;
            }

            const video = videoElement;
            const context = contextRef.current;
            const canvas = canvasRef.current;

            // Only process if video time has changed significantly, unless forced update
            if (!forceUpdate && Math.abs(video.currentTime - lastProcessedTimeRef.current) < 0.05) {
                return;
            }

            // Only update the time reference if it's not a forced update
            if (!forceUpdate) {
                lastProcessedTimeRef.current = video.currentTime;
            }

            // Calculate dimensions based on aspect ratio
            const aspectRatio = video.videoWidth / video.videoHeight;
            const width = asciiResolution;
            const height = Math.floor((aspectRatioMultiplier * width) / aspectRatio);



            // Update canvas size if needed
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }

            // Draw current video frame to canvas
            context.drawImage(video, 0, 0, width, height);

            // Process the frame based on color settings
            if (useColors) {
                const imageData = context.getImageData(0, 0, width, height);
                const greyscale = getGreyscale(imageData);
                const colors = getColors(imageData);
                const coloredFrame = getColoredAsciiFromGreyscale(
                    greyscale,
                    colors,
                    palette,
                    isColorInverted,
                    contrast,
                    brightness,
                );
                setCurrentFrame(coloredFrame);
            } else {
                const frameAscii = getAsciiFromContext(
                    context,
                    palette,
                    isColorInverted,
                    contrast,
                    brightness,
                );
                setCurrentFrame(frameAscii);
            }
        } catch (error) {
            console.error('Error processing video frame:', error);
            setCurrentFrame('Error processing video');
        }
    }, [videoElement, asciiResolution, palette, isColorInverted, contrast, brightness, useColors]);

    // Start animation loop when video is ready
    React.useEffect(() => {
        if (!videoElement || videoElement.readyState < 2) {
            return;
        }



        const animate = (currentTime: number) => {
            if (!videoElement) {
                animationFrameRef.current = requestAnimationFrame(animate);
                return;
            }

            const timeSinceLastFrame = currentTime - lastFrameTimeRef.current;
            const targetFrameTime = 1000 / frameRate;

            if (timeSinceLastFrame >= targetFrameTime) {
                processFrame();
                lastFrameTimeRef.current = currentTime;
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [videoElement, processFrame, frameRate]);

    // Process initial frame when video is ready
    React.useEffect(() => {
        if (videoElement && videoElement.readyState >= 2) {
            processFrame();
        }
    }, [videoElement, processFrame]);

    // Process frame immediately when props change (for instant updates)
    React.useEffect(() => {
        if (videoElement && videoElement.readyState >= 2) {
            processFrame(true);
        }
    }, [palette, asciiResolution, isColorInverted, contrast, brightness, useColors, processFrame]);

    // Hidden canvas for processing
    const canvasStyle: React.CSSProperties = {
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
    };

    return (
        <>
            <canvas ref={canvasRef} style={canvasStyle} />
            {!currentFrame || !videoElement || videoElement.readyState < 2 ? (
                <div className="ascii" style={style}>Loading...</div>
            ) : typeof currentFrame === 'string' ? (
                <div className="ascii" style={style}>{currentFrame}</div>
            ) : (
                <ColoredAscii
                    ascii={currentFrame.ascii}
                    colors={currentFrame.colors}
                    style={style || {}}
                />
            )}
        </>
    );
};

// Legacy component for backward compatibility
export const AsciiVideo = ({
    asciiFrames,
    frameRate = 10,
    style,
}: {
    asciiFrames: string[] | { ascii: string; colors: string[] }[];
    frameRate?: number;
    style?: React.CSSProperties;
}): JSX.Element | null => {
    if (asciiFrames.length === 0) {
        return null;
    }

    const [currentFrameIndex, setCurrentFrameIndex] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFrameIndex((prevIndex) => (prevIndex + 1) % asciiFrames.length);
        }, 1000 / frameRate);

        return () => clearInterval(interval);
    }, [asciiFrames.length, frameRate]);

    const currentFrame = asciiFrames[currentFrameIndex];

    if (typeof currentFrame === 'string') {
        return <div style={style}>{currentFrame}</div>;
    } else {
        return (
            <ColoredAscii
                ascii={currentFrame.ascii}
                colors={currentFrame.colors}
                style={style || {}}
            />
        );
    }
};
