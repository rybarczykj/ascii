import { ReactElement } from 'react';
import { Dropdown, SliderSection, DragDropFiles } from '../../../shared/components';
import { SpecsState, Fonts, Font } from '../../../shared/types';
import heic2any from 'heic2any';
import React from 'react';
import { debounce } from 'lodash';
import { getAsciiFromGreyscale, getGreyscale, resizeImage, getColors, getColoredAsciiFromGreyscale } from '../ascii-utils';
import '../../../shared/styles/menu.css';

export const ASCIICHARS = [
    '8M0|*|::`,.',
    'M80*|:,.` ',
    '$H2a?+.   ',
    '8+::`..',
    '+-:`  ',
    '▓▒▒░░ ',
    '░▒▓▔▕▖▗▘▙▚▛▜▝▞▟ ',
    '░▒▓█▄▀│┤╣║╚╔╗╝┐╩└╦╠┴═┬├╬─┼┘┌¦┼└┴┬├┐',
    '$@WgBMQNR8%0&đD#OGKEHdbmSqpAPwU54ZX96f23kVhaeFCj1IoJyst7}{YnulzriTx?][*Lcv×<>)(/+=÷""!;:','-.',
    '☮Bbeo- ',
    '☮8O0o:. ',
    '♥♧♢♰♺ ',
    '☮!*-·   ',
    ['8 ', 'M ', '0 ', '# ', '$ ', '| ', '* ', '+ ', ': ', ': ', '` ', '. ', '. '],
];

const asciiOptions = ASCIICHARS.map((char) => ({ value: char, label: char }));

interface AsciiMenuContainerProps {
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
    isVideo?: boolean;
}

interface AsciiMenuProps extends Omit<AsciiMenuContainerProps, 'onAsciiChange'> {
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
    useColors: boolean;
    onUseColorsToggle: () => void;
    isVideo?: boolean;
}

const AsciiMenu = ({
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
}: AsciiMenuProps): ReactElement => {
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
                        showFontWeight={true}
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

export const AsciiMenuContainer = (props: AsciiMenuContainerProps): ReactElement => {
    const { specs, onAsciiChange, onSpecsChange } = props;

    const [currentFile, setCurrentFile] = React.useState<File>();
    const [isAsciiVideo, setIsAsciiVideo] = React.useState(false);

    const greyscale = React.useRef<number[][]>([]);
    const colors = React.useRef<string[][]>([]);

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
        props.onVideoUpload(videoFile);
        setIsAsciiVideo(true);
        setCurrentFile(videoFile);
    };

    return (
        <AsciiMenu
            {...props}
            isVideo={props.isVideo}
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
                debouncedOnContrastChange(contrast);
            }}
            brightness={props.brightness}
            onBrightnessChange={(brightness) => {
                props.onBrightnessChange(brightness);
                debouncedOnBrightnessChange(brightness);
            }}
            useColors={props.useColors}
            onUseColorsToggle={() => {
                props.onUseColorsToggle();
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

