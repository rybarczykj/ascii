import '../../shared/styles/menu.css';
import '../../index.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AsciiMenuContainer as Menu } from './components/AsciiMenu';
import { StreamingAsciiVideo } from './components/StreamingAsciiVideo';
import { StreamingVideoProcessor } from './components/StreamingVideoProcessor';
import { ColoredAscii } from './components/ColoredAscii';
import { getAsciiFromContext, getGreyscale, getColors, getColoredAsciiFromGreyscale } from './ascii-utils';
import { SpecsState } from '../../shared/types';

const AsciiPage: React.FC = () => {
    const navigate = useNavigate();

    // Keyboard shortcut: press 'd' to go to dots mode
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }
            if (e.key === 'd' || e.key === 'D') {
                navigate('/dots');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

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

    // Video streaming state
    const [videoFile, setVideoFile] = React.useState<File | null>(null);
    const [videoElement, setVideoElement] = React.useState<HTMLVideoElement | null>(null);
    const [isStreamingVideo, setIsStreamingVideo] = React.useState(false);

    // Image state (for non-video files)
    const [imageAscii, setImageAscii] = React.useState<string>('');
    const [imageColors, setImageColors] = React.useState<string[]>([]);

    // Visual settings
    const [selectedPalette, setSelectedPalette] = React.useState<string | string[]>('8M0|*|::`,.');
    const [isColorInverted, setIsColorInverted] = React.useState(false);
    const [useColors, setUseColors] = React.useState(false);
    const [contrast, setContrast] = React.useState(1);
    const [brightness, setBrightness] = React.useState(0);

    const lineHeight = 1000 / specs.resolution;

    // Handle video upload - go directly to streaming mode
    const handleVideoUpload = (file: File) => {
        setVideoFile(file);
        setIsStreamingVideo(true);
        setImageAscii('');
        setImageColors([]);
    };

    // Handle image upload - process immediately
    const handleImageUpload = (file: File) => {
        setVideoFile(null);
        setIsStreamingVideo(false);

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            const aspectRatio = img.width / img.height;
            const width = specs.resolution;
            const height = Math.floor((0.6 * width) / aspectRatio);

            canvas.width = width;
            canvas.height = height;
            context?.drawImage(img, 0, 0, width, height);

            if (useColors) {
                const imageData = context?.getImageData(0, 0, width, height);
                if (imageData) {
                    const greyscale = getGreyscale(imageData);
                    const colors = getColors(imageData);
                    const coloredAscii = getColoredAsciiFromGreyscale(
                        greyscale,
                        colors,
                        selectedPalette,
                        isColorInverted,
                        contrast,
                        brightness,
                    );
                    setImageAscii(coloredAscii.ascii);
                    setImageColors(coloredAscii.colors);
                }
            } else {
                if (context) {
                    const frameAscii = getAsciiFromContext(
                        context,
                        selectedPalette,
                        isColorInverted,
                        contrast,
                        brightness,
                    );
                    setImageAscii(frameAscii);
                    setImageColors([]);
                }
            }
        };

        img.src = URL.createObjectURL(file);
    };

    // Legacy handler for Menu compatibility
    const handleAsciiChange = (asciiData: string | string[] | { ascii: string; colors: string[] }[], resolution: number, colors?: string[]) => {
        if (typeof asciiData === 'string') {
            setImageAscii(asciiData);
            setImageColors(colors || []);
        }
    };

    return (
        <div className="flex-container">
            <Menu
                specs={specs}
                onSpecsChange={setSpecs}
                onAsciiChange={handleAsciiChange}
                onCopy={() => {
                    const textToCopy = isStreamingVideo
                        ? "Video streaming - use browser copy on the ASCII output"
                        : imageAscii;
                    navigator.clipboard.writeText(textToCopy);
                }}
                onVideoUpload={handleVideoUpload}
                onImageUpload={handleImageUpload}
                palette={selectedPalette}
                onPaletteChange={setSelectedPalette}
                isColorInverted={isColorInverted}
                onColorInvertedToggle={() => setIsColorInverted(v => !v)}
                contrast={contrast}
                onContrastChange={setContrast}
                brightness={brightness}
                onBrightnessChange={setBrightness}
                useColors={useColors}
                onUseColorsToggle={() => setUseColors(v => !v)}
                isVideo={isStreamingVideo}
            />

            {/* Hidden video element for streaming */}
            <StreamingVideoProcessor
                videoFile={videoFile}
                onVideoElementReady={setVideoElement}
            />

            <pre>
                {isStreamingVideo && videoElement ? (
                    <StreamingAsciiVideo
                        videoElement={videoElement}
                        palette={selectedPalette}
                        asciiResolution={specs.resolution}
                        isColorInverted={isColorInverted}
                        contrast={contrast}
                        brightness={brightness}
                        useColors={useColors}
                        frameRate={10}
                        style={{
                            fontSize: `${lineHeight * 1 * specs.zoom}px`,
                            lineHeight: `${lineHeight * specs.zoom}px`,
                            fontWeight: specs.weight,
                            fontFamily: specs.fontFamily,
                            letterSpacing: `${specs.kerning}px`,
                        }}
                        aspectRatioMultiplier={0.6}
                    />
                ) : imageAscii ? (
                    imageColors.length > 0 ? (
                        <ColoredAscii
                            ascii={imageAscii}
                            colors={imageColors}
                            style={{
                                fontSize: `${lineHeight * 1 * specs.zoom}px`,
                                lineHeight: `${lineHeight * specs.zoom}px`,
                                fontWeight: specs.weight,
                                fontFamily: specs.fontFamily,
                                letterSpacing: `${specs.kerning}px`,
                            }}
                        />
                    ) : (
                        <div
                            className="ascii"
                            style={{
                                fontSize: `${lineHeight * 1 * specs.zoom}px`,
                                lineHeight: `${lineHeight * specs.zoom}px`,
                                fontWeight: specs.weight,
                                fontFamily: specs.fontFamily,
                                letterSpacing: `${specs.kerning}px`,
                            }}>
                            {imageAscii}
                        </div>
                    )
                ) : (
                    <div
                        className="ascii"
                        style={{
                            fontSize: `${lineHeight * 1 * specs.zoom}px`,
                            lineHeight: `${lineHeight * specs.zoom}px`,
                            fontWeight: specs.weight,
                            fontFamily: specs.fontFamily,
                            letterSpacing: `${specs.kerning}px`,
                        }}>
                        &apos;((-.-)/^&apos;
                    </div>
                )}
            </pre>
        </div>
    );
};

export default AsciiPage;


