import { ReactElement } from 'react';
import PaletteDropdown from './PaletteDropdown';
import { SliderSection } from './SliderSection';
import { SpecsState } from './App';

export const Menu = ({
    onFileUpload,
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
                    accept="image/*"
                    onChange={(event) => {
                        const myFile = event.target.files?.[0];
                        if (!myFile) {
                            return;
                        }
                        onFileUpload(myFile);
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
