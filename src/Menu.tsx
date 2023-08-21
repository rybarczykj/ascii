import { ReactElement } from 'react';
import PaletteDropdown from './PaletteDropdown';
import { SliderSection } from './SliderSection';
import { SpecsState } from './App';
import { heic2any } from 'heic-convert'; // Import heic2any function

export const Menu = ({
    onFileUpload,
    onVideoUpload,
    onResolutionChange,
    specs,
    onSpecsChange,
    palette,
    onPaletteChange,
    isColorInverted,
    onColorInvertedToggle,
    onCopy,
}: {
    onFileUpload: (file: File) => void;
    onVideoUpload: (video: File) => void;
    onResolutionChange: (resolution: number) => void;
    specs: SpecsState;
    onSpecsChange: (specs: SpecsState) => void;
    palette: string | string[];
    onPaletteChange: (palette: string | string[]) => void;
    isColorInverted: boolean;
    onColorInvertedToggle: () => void;
    onCopy: () => void;
}): ReactElement => {
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
                            try {
                                // Convert HEIC image to JPEG format
                                const jpegBlob = heic2any({
                                    blob: myFile,
                                    toType: 'image/jpeg',
                                });

                                // Create a new File instance with the converted blob
                                const convertedFile = new File(
                                    [jpegBlob],
                                    myFile.name.replace('.heic', '.jpg'),
                                    { type: 'image/jpeg' },
                                );

                                // Continue processing with the converted image
                                onFileUpload(convertedFile);
                            } catch (error) {
                                console.error('Error converting HEIC image:', error);
                            }
                        } else {
                            onFileUpload(myFile);
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
