import { ReactElement } from 'react';
import { SliderSection, DragDropFiles, Slider, Dropdown } from '../../../shared/components';
import { SpecsState } from '../../../shared/types';
import heic2any from 'heic2any';
import React from 'react';
import '../../../shared/styles/menu.css';

export type DotShape = '● circle' | '■ square' | '◆ diamond' | '▲ triangle' | '✚ cross' | '○ ring';

export const DOT_SHAPES: { value: DotShape; label: DotShape }[] = [
    { value: '● circle', label: '● circle' },
    { value: '■ square', label: '■ square' },
    { value: '◆ diamond', label: '◆ diamond' },
    { value: '▲ triangle', label: '▲ triangle' },
    { value: '✚ cross', label: '✚ cross' },
    { value: '○ ring', label: '○ ring' },
];

interface DotsMenuProps {
    specs: SpecsState;
    onSpecsChange: (specs: SpecsState) => void;
    onVideoUpload: (file: File) => void;
    onImageUpload: (file: File) => void;
    isColorInverted: boolean;
    onColorInvertedToggle: () => void;
    contrast: number;
    onContrastChange: (contrast: number) => void;
    brightness: number;
    onBrightnessChange: (brightness: number) => void;
    gamma: number;
    onGammaChange: (gamma: number) => void;
    useColors: boolean;
    onUseColorsToggle: () => void;
    onResolutionChange: (resolution: number) => void;
    minDotSize: number;
    onMinDotSizeChange: (size: number) => void;
    maxDotSize: number;
    onMaxDotSizeChange: (size: number) => void;
    shape: DotShape;
    onShapeChange: (shape: DotShape) => void;
    forceOGColors: boolean;
    onForceOGColorsToggle: () => void;
    removeWhite: boolean;
    onRemoveWhiteToggle: () => void;
    whitePoint: number;
    onWhitePointChange: (value: number) => void;
    frameRate: number;
    onFrameRateChange: (value: number) => void;
    showOriginalBackground: boolean;
    onShowOriginalBackgroundToggle: () => void;
}

export const DotsMenu = ({
    specs,
    onSpecsChange,
    onImageUpload,
    onVideoUpload,
    onResolutionChange,
    isColorInverted,
    onColorInvertedToggle,
    contrast,
    onContrastChange,
    brightness,
    onBrightnessChange,
    gamma,
    onGammaChange,
    useColors,
    onUseColorsToggle,
    minDotSize,
    onMinDotSizeChange,
    maxDotSize,
    onMaxDotSizeChange,
    shape,
    onShapeChange,
    forceOGColors,
    onForceOGColorsToggle,
    removeWhite,
    onRemoveWhiteToggle,
    whitePoint,
    onWhitePointChange,
    frameRate,
    onFrameRateChange,
    showOriginalBackground,
    onShowOriginalBackgroundToggle,
}: DotsMenuProps): ReactElement => {
    const imageUploadHandler = (imageFile: File) => {
        if (imageFile.type === 'image/heic') {
            try {
                heic2any({
                    blob: imageFile,
                    toType: 'image/jpeg',
                }).then((convertedBlob) => {
                    const convertedFile = new File(
                        [convertedBlob as Blob],
                        imageFile.name.replace('.heic', '.jpg'),
                        { type: 'image/jpeg' },
                    );
                    onImageUpload(convertedFile);
                });
            } catch (error) {
                console.error('Error converting HEIC image:', error);
            }
        } else {
            onImageUpload(imageFile);
        }
    };

    return (
        <DragDropFiles onDrop={imageUploadHandler}>
            <div className="flex-row">
                <div className="menu">
                    <div className="menu-entry">
                        <label htmlFor="file-upload" className="clickable-button">
                            Upload an image
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*, .heic"
                            onChange={(event) => {
                                const myFile = event.target.files?.[0];
                                if (!myFile) {
                                    return;
                                }
                                imageUploadHandler(myFile);
                            }}
                        />
                    </div>
                    <div className="menu-entry">
                        <label htmlFor="video-upload" className="clickable-button">
                            Upload a video
                        </label>
                        <input
                            id="video-upload"
                            type="file"
                            accept="video/*"
                            onChange={(event) => {
                                const videoFile = event.target.files?.[0];
                                if (!videoFile) {
                                    return;
                                }
                                onVideoUpload(videoFile);
                            }}
                        />
                    </div>
                    <SliderSection
                        specs={specs}
                        onSpecsChange={onSpecsChange}
                        onResolutionChange={onResolutionChange}
                        contrast={contrast}
                        onContrastChange={onContrastChange}
                        brightness={brightness}
                        onBrightnessChange={onBrightnessChange}
                        gamma={gamma}
                        onGammaChange={onGammaChange}
                        showFontWeight={false}
                    />

                    <Slider
                        title="min dot size"
                        label="min"
                        value={minDotSize}
                        min={-5}
                        max={25}
                        step={0.1}
                        onChange={onMinDotSizeChange}
                    />
                    <Slider
                        title="max dot size"
                        label="max"
                        value={maxDotSize}
                        min={0}
                        max={25}
                        step={0.1}
                        onChange={onMaxDotSizeChange}
                    />

                    <Dropdown
                        label="shape"
                        options={DOT_SHAPES}
                        selectedOption={shape}
                        onOptionChange={onShapeChange}
                    />

                    <Slider
                        title="framerate (fps)"
                        label={frameRate.toString()}
                        value={frameRate}
                        min={1}
                        max={60}
                        step={1}
                        onChange={onFrameRateChange}
                    />

                    <form>
                        <div className="menu-entry">
                            <div className="checkboxes">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={isColorInverted}
                                        onChange={onColorInvertedToggle}
                                    />
                                    {'inverse?'}
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={useColors}
                                        onChange={onUseColorsToggle}
                                    />
                                    {'use colors?'}
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={forceOGColors}
                                        onChange={onForceOGColorsToggle}
                                    />
                                    {'force OG colors?'}
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={removeWhite}
                                        onChange={onRemoveWhiteToggle}
                                    />
                                    {'remove white?'}
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={showOriginalBackground}
                                        onChange={onShowOriginalBackgroundToggle}
                                    />
                                    {'show original?'}
                                </label>
                            </div>
                            {removeWhite && (
                                <Slider
                                    title="white point"
                                    label={whitePoint.toString()}
                                    value={whitePoint}
                                    min={0}
                                    max={255}
                                    step={1}
                                    onChange={onWhitePointChange}
                                />
                            )}
                        </div>
                    </form>

                </div>
            </div>
        </DragDropFiles>
    );
};

