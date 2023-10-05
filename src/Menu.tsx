import { ReactElement } from 'react';
import PaletteDropdown, { ASCIICHARS } from './PaletteDropdown';
import { SliderSection } from './SliderSection';
import { SpecsState } from './App';
import heic2any from 'heic2any';
import React from 'react';
import { processVideoFrames } from './video/process-video';
import { debounce, set, slice } from 'lodash';
import { getAsciiFromCanvas, resizeImage } from './ascii-utils';

interface MenuContainerProps {
    onAsciiChange: (ascii: string | string[]) => void;
    specs: SpecsState;
    onSpecsChange: (specs: SpecsState) => void;
    onCopy: () => void;
}

// extend MenuContainerProps
interface MenuProps extends Omit<MenuContainerProps, 'onAsciiChange'> {
    onImageUpload: (file: File) => void;
    onVideoUpload: (video: File) => void;
    onResolutionChange: (resolution: number) => void;
    palette: string | string[];
    onPaletteChange: (palette: string | string[]) => void;
    isColorInverted: boolean;
    onColorInvertedToggle: () => void;
}

const Menu = ({
    specs,
    onSpecsChange,
    onCopy,
    onImageUpload,
    onVideoUpload,
    onResolutionChange,
    palette,
    onPaletteChange,
    isColorInverted,
    onColorInvertedToggle,
}: MenuProps): ReactElement => {
    return (
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
                        if (myFile.type === 'image/heic') {
                            // Convert HEIC image to JPEG format
                            try {
                                heic2any({
                                    blob: myFile,
                                    toType: 'image/jpeg',
                                }).then((convertedBlob) => {
                                    const convertedFile = new File(
                                        [convertedBlob as Blob],
                                        myFile.name.replace('.heic', '.jpg'),
                                        { type: 'image/jpeg' },
                                    );

                                    // Continue processing with the converted image
                                    onImageUpload(convertedFile);
                                });

                                // Create a new File instance with the converted blob
                            } catch (error) {
                                console.error('Error converting HEIC image:', error);
                            }
                        } else {
                            onImageUpload(myFile);
                        }
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
            />
            <PaletteDropdown selectedOption={palette} onOptionChange={onPaletteChange} />

            <form>
                <div className="checkboxes">
                    <label>
                        <input
                            type="checkbox"
                            checked={isColorInverted}
                            onChange={onColorInvertedToggle}
                        />
                        {'inverse?'}
                    </label>
                </div>
            </form>

            <div className="menu-entry">
                <label htmlFor="clipboard-button" className="clickable-button">
                    Save to clipboard
                </label>

                <button id="clipboard-button" className="hidden-button" onClick={onCopy}>
                    {'save to clipboard'}
                </button>
            </div>
        </div>
    );
};

export const MenuContainer = (props: MenuContainerProps): ReactElement => {
    const { specs, onAsciiChange, onSpecsChange } = props;

    const [currentFile, setCurrentFile] = React.useState<File>();
    const [isAsciiVideo, setIsAsciiVideo] = React.useState(false);
    const [selectedPalette, setSelectedPalette] = React.useState<string | string[]>(ASCIICHARS[0]);
    const [isColorInverted, setInvert] = React.useState(false);

    const video = document.createElement('video');

    const updateAscii = ({
        palette,
        isColorInverted,
        resolution,
        file,
        isVideo,
    }: {
        palette: string | string[];
        isColorInverted: boolean;
        resolution: number;
        file: File | undefined;
        isVideo: boolean;
    }) => {
        if (!file) {
            return;
        }
        console.log('file', file);
        if (isVideo) {
            video.src = URL.createObjectURL(file);

            processVideoFrames(video, palette, resolution, isColorInverted, onAsciiChange);
        } else {
            resizeImage({
                file: file,
                maxWidth: resolution,
            }).then((canvas) => {
                const newAscii = getAsciiFromCanvas(canvas, palette, isColorInverted);

                onAsciiChange(newAscii);
            });
        }
    };

    const debouncedOnResolutionChange = debounce((resolution: number) => {
        onSpecsChange({
            ...specs,
            resolution: resolution,
        });
        updateAscii({
            palette: selectedPalette,
            isColorInverted,
            resolution,
            file: currentFile,
            isVideo: isAsciiVideo,
        });
    }, 0);

    return (
        <Menu
            {...props}
            onResolutionChange={debouncedOnResolutionChange}
            onImageUpload={(imageFile) => {
                setIsAsciiVideo(false);
                updateAscii({
                    palette: selectedPalette,
                    isColorInverted,
                    resolution: specs.resolution,
                    file: imageFile,
                    isVideo: false,
                });
                setCurrentFile(imageFile);
            }}
            onVideoUpload={(videoFile) => {
                setIsAsciiVideo(true);
                updateAscii({
                    palette: selectedPalette,
                    isColorInverted,
                    resolution: specs.resolution,
                    file: videoFile,
                    isVideo: true,
                });
                setCurrentFile(videoFile);
            }}
            palette={selectedPalette}
            onPaletteChange={(newPalette) => {
                setSelectedPalette(newPalette);
                updateAscii({
                    palette: newPalette,
                    isColorInverted,
                    resolution: specs.resolution,
                    file: currentFile,
                    isVideo: isAsciiVideo,
                });
            }}
            isColorInverted={isColorInverted}
            onColorInvertedToggle={() => {
                setInvert(!isColorInverted);
                updateAscii({
                    palette: selectedPalette,
                    isColorInverted: !isColorInverted,
                    resolution: specs.resolution,
                    file: currentFile,
                    isVideo: isAsciiVideo,
                });
            }}
        />
    );
};
