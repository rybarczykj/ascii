import { ReactElement } from 'react';
import Dropdown from '../Dropdown/Dropdown';
import { SliderSection } from '../SliderSection/SliderSection';
import { Font, Fonts, SpecsState } from '../../App';
import heic2any from 'heic2any';
import React from 'react';
import { processVideoFrames } from '../../video/process-video';
import { debounce, set, slice } from 'lodash';
import { getAsciiFromGreyscale, getGreyscale, resizeImage } from '../../ascii-utils';
import './menu.css';
import { DragDropFiles } from './DragDropFiles';

export const ASCIICHARS = [
    '8M0|*|::`,.',
    'M80*|:,.` ',
    '$H2a?+.   ',
    '8+::`..',
    '+-:`  ',
    '▓▒▒░░ ',
    '░▒▓▔▕▖▗▘▙▚▛▜▝▞▟ ',
    '░▒▓█▄▀│┤╣║╚╔╗╝┐╩└╦╠┴═┬├╬─┼┘┌¦┼└┴┬├┐',
    '$@WgBMQNR8%0&đD#OGKEHdbmSqpAPwU54ZX96f23kVhaeFCj1IoJyst7}{YnulzriTx?][*Lcv×<>)(/+=÷“”!;:‘,’-.',
    ['8 ', 'M ', '0 ', '# ', '$ ', '| ', '* ', '+ ', ': ', ': ', '` ', '. ', '. '],
];

const asciiOptions = ASCIICHARS.map((char) => ({ value: char, label: char }));

interface MenuContainerProps {
    onAsciiChange: (ascii: string | string[], resolution: number) => void;
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
    contrast: number;
    onContrastChange: (contrast: number) => void;
    // textColor: string;
    // onTextColorChange: (color: string) => void;
    // backgroundColor: string;
    // onBackgroundColorChange: (color: string) => void;
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
    contrast,
    onContrastChange,
}: // textColor,
// onTextColorChange,
// backgroundColor,
// onBackgroundColorChange,
MenuProps): ReactElement => {
    const imageUploadHandler = (imageFile: File) => {
        if (imageFile.type === 'image/heic') {
            // Convert HEIC image to JPEG format
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

                    // Continue processing with the converted image
                    onImageUpload(convertedFile);
                });

                // Create a new File instance with the converted blob
            } catch (error) {
                console.error('Error converting HEIC image:', error);
            }
        } else {
            onImageUpload(imageFile);
        }
    };

    return (
        <DragDropFiles onDrop={imageUploadHandler}>
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
                />
                <Dropdown
                    label="palette"
                    options={asciiOptions}
                    selectedOption={palette}
                    onOptionChange={onPaletteChange}
                />

                <Dropdown
                    label="font"
                    options={Fonts.map((font: Font) => ({ value: font, label: font }))}
                    selectedOption={specs.fontFamily}
                    onOptionChange={(font) => {
                        onSpecsChange({ ...specs, fontFamily: font as Font });
                    }}
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
                        </div>
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
        </DragDropFiles>
    );
};

export const MenuContainer = (props: MenuContainerProps): ReactElement => {
    const { specs, onAsciiChange, onSpecsChange } = props;

    const [currentFile, setCurrentFile] = React.useState<File>();
    const [isAsciiVideo, setIsAsciiVideo] = React.useState(false);
    const [selectedPalette, setSelectedPalette] = React.useState<string | string[]>(ASCIICHARS[0]);
    const [isColorInverted, setInvert] = React.useState(false);
    const [contrast, setContrast] = React.useState(1);

    const video = document.createElement('video');

    // store greyscale so it can be a lookup table
    const greyscale = React.useRef<number[][]>([]);

    const setLoadingStateIfVideo = (isVideo: boolean) => {
        if (isVideo) {
            onAsciiChange('loading...', specs.resolution);
        }
    };

    const updateAscii = ({
        palette,
        isColorInverted,
        resolution,
        file,
        isVideo,
        contrast,
        resetLookups = false,
    }: {
        palette: string | string[];
        isColorInverted: boolean;
        resolution: number;
        file: File | undefined;
        isVideo: boolean;
        contrast: number;
        resetLookups?: boolean;
    }) => {
        if (!file) {
            return;
        }

        if (isVideo) {
            video.src = URL.createObjectURL(file);

            processVideoFrames(
                video,
                palette,
                resolution,
                isColorInverted,
                (frames) => onAsciiChange(frames, resolution),
                contrast,
            );
        } else {
            resizeImage({
                file: file,
                maxWidth: resolution,
            }).then((canvas) => {
                const context = canvas.getContext('2d', {
                    willReadFrequently: true,
                });
                const data = context?.getImageData(0, 0, canvas.width, canvas.height);
                if (!data) {
                    return;
                }

                // avoid recalculating greyscale for each frame
                if (resetLookups) {
                    greyscale.current = getGreyscale(data);
                }

                const newAscii = getAsciiFromGreyscale(
                    greyscale.current,
                    palette,
                    isColorInverted,
                    contrast,
                );

                onAsciiChange(newAscii, resolution);
                // TODO: this causes unnecessary state updates, but it makes the resolution change
                // look smoothest. Maybe there's a better way to do this?
                onSpecsChange({
                    ...specs,
                    resolution: resolution,
                });
            });
        }
    };

    const debouncedOnResolutionChange = debounce((resolution: number) => {
        setLoadingStateIfVideo(isAsciiVideo);
        updateAscii({
            palette: selectedPalette,
            isColorInverted,
            resolution,
            file: currentFile,
            isVideo: isAsciiVideo,
            contrast,
            resetLookups: true,
        });
    }, 5);

    const debouncedOnContrastChange = debounce((contrast: number) => {
        setLoadingStateIfVideo(isAsciiVideo);
        setContrast(contrast);
        updateAscii({
            palette: selectedPalette,
            isColorInverted,
            resolution: specs.resolution,
            file: currentFile,
            isVideo: isAsciiVideo,
            contrast,
        });
    }, 5);

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
                    contrast,
                    resetLookups: true,
                });
                setCurrentFile(imageFile);
            }}
            onVideoUpload={(videoFile) => {
                setIsAsciiVideo(true);
                setLoadingStateIfVideo(true);
                updateAscii({
                    palette: selectedPalette,
                    isColorInverted,
                    resolution: specs.resolution,
                    file: videoFile,
                    isVideo: true,
                    contrast,
                    resetLookups: true,
                });
                setCurrentFile(videoFile);
            }}
            palette={selectedPalette}
            onPaletteChange={(newPalette) => {
                setSelectedPalette(newPalette);
                setLoadingStateIfVideo(isAsciiVideo);
                updateAscii({
                    palette: newPalette,
                    isColorInverted,
                    resolution: specs.resolution,
                    file: currentFile,
                    isVideo: isAsciiVideo,
                    contrast,
                });
            }}
            isColorInverted={isColorInverted}
            onColorInvertedToggle={() => {
                setInvert(!isColorInverted);
                setLoadingStateIfVideo(isAsciiVideo);
                updateAscii({
                    palette: selectedPalette,
                    isColorInverted: !isColorInverted,
                    resolution: specs.resolution,
                    file: currentFile,
                    isVideo: isAsciiVideo,
                    contrast,
                });
            }}
            contrast={contrast}
            onContrastChange={debouncedOnContrastChange}
        />
    );
};
