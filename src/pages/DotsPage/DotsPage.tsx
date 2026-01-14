import '../../shared/styles/menu.css';
import '../../index.css';
import React from 'react';
import { debounce } from 'lodash';
import { DotsMenu, DotShape } from './components/DotsMenu';
import { DotsCanvas } from './components/DotsCanvas';
import { processImageForDots, ProcessedPixelData, resizeImage } from './dots-utils';
import { SpecsState } from '../../shared/types';

const DotsPage: React.FC = () => {
    // Core state
    const [specs, setSpecs] = React.useState<SpecsState>({
        fontSize: 30,
        resolution: 100,
        width: 700,
        zoom: 1,
        weight: 400,
        fontFamily: 'Ibm Plex Mono',
        kerning: 0,
        lineHeight: 1,
    });

    // File state
    const [currentFile, setCurrentFile] = React.useState<File | null>(null);
    const [, setVideoFile] = React.useState<File | null>(null);
    const [videoElement, setVideoElement] = React.useState<HTMLVideoElement | null>(null);
    const [isStreamingVideo, setIsStreamingVideo] = React.useState(false);

    // Processed data
    const [pixelData, setPixelData] = React.useState<ProcessedPixelData | null>(null);

    // Visual settings
    const [isColorInverted, setIsColorInverted] = React.useState(false);
    const [useColors, setUseColors] = React.useState(true); // Default to colors for dots
    const [contrast, setContrast] = React.useState(1);
    const [brightness, setBrightness] = React.useState(0);

    // Dot size settings (as fraction of max dot size, 0-1)
    const [minDotSize, setMinDotSize] = React.useState(0.8);
    const [maxDotSize, setMaxDotSize] = React.useState(0.8);

    // Dot shape
    const [shape, setShape] = React.useState<DotShape>('● circle');

    // Force original colors (use OG colors for rendering, adjusted brightness for sizing)
    const [forceOGColors, setForceOGColors] = React.useState(false);

    // Remove white pixels above threshold
    const [removeWhite, setRemoveWhite] = React.useState(false);
    const [whitePoint, setWhitePoint] = React.useState(240);

    // Video framerate
    const [frameRate, setFrameRate] = React.useState(10);

    // Show original image/video as background
    const [showOriginalBackground, setShowOriginalBackground] = React.useState(false);

    // Log current settings for debugging
    React.useEffect(() => {
        console.log('Current DotsPage Settings:', {
            resolution: specs.resolution,
            zoom: specs.zoom,
            contrast,
            brightness,
            isColorInverted,
            useColors,
            minDotSize,
            maxDotSize,
            shape,
            forceOGColors,
            removeWhite,
            whitePoint,
            frameRate,
            showOriginalBackground,
        });
    }, [specs.resolution, specs.zoom, contrast, brightness, isColorInverted, useColors, minDotSize, maxDotSize, shape, forceOGColors, removeWhite, whitePoint, frameRate, showOriginalBackground]);

    // Process image with current settings
    const processImage = React.useCallback(async (
        file: File,
        resolution: number,
        contrastVal: number,
        brightnessVal: number,
        inverted: boolean,
        colors: boolean
    ) => {
        try {
            // Use aspectRatioMultiplier of 1.0 for dots (circles are 1:1, unlike ASCII chars)
            const canvas = await resizeImage({ file, maxWidth: resolution, aspectRatioMultiplier: 1.0 });
            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (!context) return;

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const processed = processImageForDots(imageData, contrastVal, brightnessVal, inverted, colors);
            setPixelData(processed);
        } catch (error) {
            console.error('Error processing image:', error);
        }
    }, []);

    // Handle image upload
    const handleImageUpload = React.useCallback((file: File) => {
        setCurrentFile(file);
        setVideoFile(null);
        setIsStreamingVideo(false);
        processImage(file, specs.resolution, contrast, brightness, isColorInverted, useColors);
    }, [specs.resolution, contrast, brightness, isColorInverted, useColors, processImage]);

    // Handle video upload
    const handleVideoUpload = React.useCallback((file: File) => {
        setVideoFile(file);
        setCurrentFile(null);
        setIsStreamingVideo(true);
        setPixelData(null);

        // Create video element for streaming
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        video.src = URL.createObjectURL(file);

        video.addEventListener('loadedmetadata', () => {
            setVideoElement(video);
            video.play().catch(console.warn);
        });
    }, []);

    // Video frame processing
    const animationFrameRef = React.useRef<number | null>(null);
    const lastFrameTimeRef = React.useRef<number>(0);
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

    React.useEffect(() => {
        if (!isStreamingVideo || !videoElement) return;

        // Create hidden canvas for frame extraction
        if (!canvasRef.current) {
            canvasRef.current = document.createElement('canvas');
        }
        const canvas = canvasRef.current;

        const processVideoFrame = () => {
            if (!videoElement || videoElement.readyState < 2) {
                animationFrameRef.current = requestAnimationFrame(processVideoFrame);
                return;
            }

            const now = performance.now();
            const targetFrameTime = 1000 / frameRate;

            if (now - lastFrameTimeRef.current >= targetFrameTime) {
                const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
                const width = specs.resolution;
                // Use true aspect ratio for dots (no 0.6 multiplier - that's for ASCII chars)
                const height = Math.floor(width / aspectRatio);

                canvas.width = width;
                canvas.height = height;
                const context = canvas.getContext('2d', { willReadFrequently: true });
                
                if (context) {
                    context.drawImage(videoElement, 0, 0, width, height);
                    const imageData = context.getImageData(0, 0, width, height);
                    const processed = processImageForDots(imageData, contrast, brightness, isColorInverted, useColors);
                    setPixelData(processed);
                }

                lastFrameTimeRef.current = now;
            }

            animationFrameRef.current = requestAnimationFrame(processVideoFrame);
        };

        animationFrameRef.current = requestAnimationFrame(processVideoFrame);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isStreamingVideo, videoElement, specs.resolution, contrast, brightness, isColorInverted, useColors, frameRate]);

    // Cleanup video element on unmount
    React.useEffect(() => {
        return () => {
            if (videoElement) {
                videoElement.pause();
                URL.revokeObjectURL(videoElement.src);
            }
        };
    }, [videoElement]);

    // Debounced handlers for expensive operations
    const debouncedProcessImage = React.useMemo(
        () => debounce((file: File, resolution: number, contrastVal: number, brightnessVal: number, inverted: boolean, colors: boolean) => {
            processImage(file, resolution, contrastVal, brightnessVal, inverted, colors);
        }, 50),
        [processImage]
    );

    const handleResolutionChange = React.useCallback((resolution: number) => {
        setSpecs(prev => ({ ...prev, resolution }));
        if (currentFile) {
            debouncedProcessImage(currentFile, resolution, contrast, brightness, isColorInverted, useColors);
        }
    }, [currentFile, contrast, brightness, isColorInverted, useColors, debouncedProcessImage]);

    const handleContrastChange = React.useCallback((newContrast: number) => {
        setContrast(newContrast);
        if (currentFile) {
            debouncedProcessImage(currentFile, specs.resolution, newContrast, brightness, isColorInverted, useColors);
        }
    }, [currentFile, specs.resolution, brightness, isColorInverted, useColors, debouncedProcessImage]);

    const handleBrightnessChange = React.useCallback((newBrightness: number) => {
        setBrightness(newBrightness);
        if (currentFile) {
            debouncedProcessImage(currentFile, specs.resolution, contrast, newBrightness, isColorInverted, useColors);
        }
    }, [currentFile, specs.resolution, contrast, isColorInverted, useColors, debouncedProcessImage]);

    const handleColorInvertedToggle = React.useCallback(() => {
        const newValue = !isColorInverted;
        setIsColorInverted(newValue);
        if (currentFile) {
            processImage(currentFile, specs.resolution, contrast, brightness, newValue, useColors);
        }
    }, [currentFile, specs.resolution, contrast, brightness, isColorInverted, useColors, processImage]);

    const handleUseColorsToggle = React.useCallback(() => {
        const newValue = !useColors;
        setUseColors(newValue);
        if (currentFile) {
            processImage(currentFile, specs.resolution, contrast, brightness, isColorInverted, newValue);
        }
    }, [currentFile, specs.resolution, contrast, brightness, isColorInverted, useColors, processImage]);


    return (
        <div className="flex-container">
            <DotsMenu
                specs={specs}
                onSpecsChange={setSpecs}
                onVideoUpload={handleVideoUpload}
                onImageUpload={handleImageUpload}
                isColorInverted={isColorInverted}
                onColorInvertedToggle={handleColorInvertedToggle}
                contrast={contrast}
                onContrastChange={handleContrastChange}
                brightness={brightness}
                onBrightnessChange={handleBrightnessChange}
                useColors={useColors}
                onUseColorsToggle={handleUseColorsToggle}
                onResolutionChange={handleResolutionChange}
                minDotSize={minDotSize}
                onMinDotSizeChange={setMinDotSize}
                maxDotSize={maxDotSize}
                onMaxDotSizeChange={setMaxDotSize}
                shape={shape}
                onShapeChange={setShape}
                forceOGColors={forceOGColors}
                onForceOGColorsToggle={() => setForceOGColors(v => !v)}
                removeWhite={removeWhite}
                onRemoveWhiteToggle={() => setRemoveWhite(v => !v)}
                whitePoint={whitePoint}
                onWhitePointChange={setWhitePoint}
                frameRate={frameRate}
                onFrameRateChange={setFrameRate}
                showOriginalBackground={showOriginalBackground}
                onShowOriginalBackgroundToggle={() => setShowOriginalBackground(v => !v)}
            />

            <DotsCanvas
                pixelData={pixelData}
                zoom={specs.zoom}
                resolution={specs.resolution}
                minDotSize={minDotSize}
                maxDotSize={maxDotSize}
                shape={shape}
                forceOGColors={forceOGColors}
                removeWhite={removeWhite}
                whitePoint={whitePoint}
                showOriginalBackground={showOriginalBackground}
                sourceFile={currentFile}
                videoElement={isStreamingVideo ? videoElement : null}
                className="dots-canvas"
            />
        </div>
    );
};

export default DotsPage;

