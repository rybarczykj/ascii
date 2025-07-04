import { ReactElement } from 'react';
import Dropdown from '../Dropdown/Dropdown';
import { SliderSection } from '../SliderSection/SliderSection';
import { Font, Fonts, SpecsState } from '../../App';
import heic2any from 'heic2any';
import React from 'react';

import { debounce } from 'lodash';
import { getAsciiFromGreyscale, getGreyscale, resizeImage, getColors, getColoredAsciiFromGreyscale } from '../../ascii-utils';
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
    '☮Bbeo- ',
    '☮8O0o:. ',
    '♥♧♢♰♺ ',
    '☮!*-·   ',
    ['8 ', 'M ', '0 ', '# ', '$ ', '| ', '* ', '+ ', ': ', ': ', '` ', '. ', '. '],
];

const asciiOptions = ASCIICHARS.map((char) => ({ value: char, label: char }));

interface MenuContainerProps {
    onAsciiChange: (ascii: string | string[] | { ascii: string; colors: string[] }[], resolution: number, colors?: string[]) => void;
    specs: SpecsState;
    onSpecsChange: (specs: SpecsState) => void;
    onCopy: () => void;
    onVideoUpload: (file: File) => void;
    onImageUpload: (file: File) => void;
    palette: string | string[];
    onPaletteChange: (palette: string | string[]) => void;
    isColorInverted: boolean;
    onColorInvertedToggle: () => void;
    contrast: number;
    onContrastChange: (contrast: number) => void;
    brightness: number;
    onBrightnessChange: (brightness: number) => void;
    useColors: boolean;
    onUseColorsToggle: () => void;
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
    brightness: number;
    onBrightnessChange: (brightness: number) => void;
    // textColor: string;
    // onTextColorChange: (color: string) => void;`
    // backgroundColor: string;
    // onBackgroundColorChange: (color: string) => void;
    useColors: boolean;
    onUseColorsToggle: () => void;
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
    brightness,
    onBrightnessChange,
    useColors,
    onUseColorsToggle,
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
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={useColors}
                                        onChange={onUseColorsToggle}
                                    />
                                    {'use colors?'}
                                </label>
                            </div>
                        </div>
                    </form>

                    <div className="menu-entry">
                        <label htmlFor="clipboard-button" className="clickable-button">
                            Save to clipboard
                        </label>

                        <button id="clipboard-button" className="hidden-button" onClick={onCopy} />
                    </div>
                </div>
            </div>
        </DragDropFiles>
    );
};

export const MenuContainer = (props: MenuContainerProps): ReactElement => {
    const { specs, onAsciiChange, onSpecsChange } = props;

    const [currentFile, setCurrentFile] = React.useState<File>();
    const [isAsciiVideo, setIsAsciiVideo] = React.useState(false);

    // store greyscale so it can be a lookup table (only for images)
    const greyscale = React.useRef<number[][]>([]);
    const colors = React.useRef<string[][]>([]);



    // Simplified updateAscii function - only handles images now
    const updateAscii = ({
        palette,
        isColorInverted,
        resolution,
        file,
        contrast,
        brightness,
        resetLookups,
        useColors,
    }: {
        palette: string | string[];
        isColorInverted: boolean;
        resolution: number;
        file: File | undefined;
        contrast: number;
        brightness: number;
        resetLookups: boolean;
        useColors: boolean;
    }) => {
        if (!file) {
            return;
        }

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
                colors.current = getColors(data);
            }

            if (useColors) {
                const coloredAscii = getColoredAsciiFromGreyscale(
                    greyscale.current,
                    colors.current,
                    palette,
                    isColorInverted,
                    contrast,
                    brightness,
                );
                onAsciiChange(coloredAscii.ascii, resolution, coloredAscii.colors);
            } else {
                const newAscii = getAsciiFromGreyscale(
                    greyscale.current,
                    palette,
                    isColorInverted,
                    contrast,
                    brightness,
                );
                onAsciiChange(newAscii, resolution);
            }

            onSpecsChange({
                ...specs,
                resolution: resolution,
            });
        });
    };

    const debouncedOnResolutionChange = debounce((resolution: number) => {
        // For video mode, just update the specs directly since we're using streaming
        if (isAsciiVideo) {
            props.onSpecsChange({
                ...props.specs,
                resolution: resolution,
            });
        } else {
            updateAscii({
                palette: props.palette,
                isColorInverted: props.isColorInverted,
                resolution,
                file: currentFile,
                contrast: props.contrast,
                brightness: props.brightness,
                resetLookups: true,
                useColors: props.useColors,
            });
        }
    }, 5);

    const debouncedOnContrastChange = debounce((contrast: number) => {
        // For video mode, just update the contrast directly since we're using streaming
        if (isAsciiVideo) {
            props.onContrastChange(contrast);
        } else {
            updateAscii({
                palette: props.palette,
                isColorInverted: props.isColorInverted,
                resolution: specs.resolution,
                file: currentFile,
                contrast,
                brightness: props.brightness,
                resetLookups: false,
                useColors: props.useColors,
            });
        }
    }, 5);

    const debouncedOnBrightnessChange = debounce((brightness: number) => {
        // For video mode, just update the brightness directly since we're using streaming
        if (isAsciiVideo) {
            props.onBrightnessChange(brightness);
        } else {
            updateAscii({
                palette: props.palette,
                isColorInverted: props.isColorInverted,
                resolution: specs.resolution,
                file: currentFile,
                contrast: props.contrast,
                brightness,
                resetLookups: false,
                useColors: props.useColors,
            });
        }
    }, 5);

    const handleVideoUpload = (videoFile: File) => {
        // Use the new streaming approach by calling the prop directly
        props.onVideoUpload(videoFile);
        // Set the local state to indicate we're in video mode
        setIsAsciiVideo(true);
        setCurrentFile(videoFile);
    };

    return (
        <Menu
            {...props}
            onResolutionChange={debouncedOnResolutionChange}
            onImageUpload={(imageFile) => {
                setIsAsciiVideo(false);
                updateAscii({
                    palette: props.palette,
                    isColorInverted: props.isColorInverted,
                    resolution: specs.resolution,
                    file: imageFile,
                    contrast: props.contrast,
                    brightness: props.brightness,
                    resetLookups: true,
                    useColors: props.useColors,
                });
                setCurrentFile(imageFile);
            }}
            onVideoUpload={handleVideoUpload}
            palette={props.palette}
            onPaletteChange={(newPalette) => {
                props.onPaletteChange(newPalette);
                // For video mode, just update the palette directly since we're using streaming
                if (!isAsciiVideo) {
                    updateAscii({
                        palette: newPalette,
                        isColorInverted: props.isColorInverted,
                        resolution: specs.resolution,
                        file: currentFile,
                        brightness: props.brightness,
                        contrast: props.contrast,
                        resetLookups: false,
                        useColors: props.useColors,
                    });
                }
            }}
            isColorInverted={props.isColorInverted}
            onColorInvertedToggle={() => {
                props.onColorInvertedToggle();
                // For video mode, just update the color inversion directly since we're using streaming
                if (!isAsciiVideo) {
                    updateAscii({
                        palette: props.palette,
                        isColorInverted: !props.isColorInverted,
                        resolution: specs.resolution,
                        file: currentFile,
                        brightness: props.brightness,
                        contrast: props.contrast,
                        resetLookups: false,
                        useColors: props.useColors,
                    });
                }
            }}
            contrast={props.contrast}
            onContrastChange={(contrast) => {
                props.onContrastChange(contrast);
                // For video mode, the debounced function will handle it directly
                // For image mode, it will process through updateAscii
                debouncedOnContrastChange(contrast);
            }}
            brightness={props.brightness}
            onBrightnessChange={(brightness) => {
                props.onBrightnessChange(brightness);
                // For video mode, the debounced function will handle it directly
                // For image mode, it will process through updateAscii
                debouncedOnBrightnessChange(brightness);
            }}
            useColors={props.useColors}
            onUseColorsToggle={() => {
                props.onUseColorsToggle();
                // For video mode, just update the use colors setting directly since we're using streaming
                if (!isAsciiVideo) {
                    updateAscii({
                        palette: props.palette,
                        isColorInverted: props.isColorInverted,
                        resolution: specs.resolution,
                        file: currentFile,
                        brightness: props.brightness,
                        contrast: props.contrast,
                        resetLookups: false,
                        useColors: !props.useColors,
                    });
                }
            }}
        />
    );
};
