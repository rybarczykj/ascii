import './index.css';
import React from 'react';
import debounce from 'lodash.debounce';
import { resizeImage, getAsciiFromCanvas, ASCIICHARS } from './ascii-utils';
import { SliderSection } from './SliderSection';
import PaletteDropdown from './Dropdown';

const ARTWIDTH = 700;

export interface SpecsState {
    fontSize: number;
    resolution: number;
    width: number;
    zoom: number;
}

const initialState = {
    fontSize: 30,
    resolution: 100,
    width: ARTWIDTH,
    zoom: 1,
};

const App: React.FC = () => {
    const [ascii, setAscii] = React.useState('');
    const [currentFile, setCurrentFile] = React.useState<File>();
    const [specs, setSpecs] = React.useState<SpecsState>(initialState);

    const [palette, setPalette] = React.useState<string>(ASCIICHARS[0]);

    const [invert, setInvert] = React.useState(false);

    const onResolutionChange = (
        imageFile: File,
        newResolution: number,
        palette: string,
        invert: boolean,
    ) => {
        resizeImage({
            file: imageFile,
            maxWidth: newResolution,
        }).then((canvas) => {
            const newAscii = getAsciiFromCanvas(canvas, palette, invert);
            const newFontSize = specs.width / newResolution;

            setSpecs({
                ...specs,
                fontSize: newFontSize,
                resolution: newResolution,
            });
            setAscii(newAscii);
        });
    };

    const debounceOnresolutionChange = debounce(
        (file: File, resolution, palette, invert) =>
            onResolutionChange(file, resolution, palette, invert),
        0,
    );

    return (
        <div className="flex-container">
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
                            setCurrentFile(myFile);
                            debounceOnresolutionChange(
                                myFile,
                                initialState.resolution,
                                palette,
                                invert,
                            );
                        }}
                    />
                </div>
                <SliderSection
                    specs={specs}
                    onSpecsChange={(specs) => {
                        setSpecs(specs);
                    }}
                    onResolutionChange={(resolution) => {
                        if (!currentFile) {
                            return;
                        }
                        debounceOnresolutionChange(currentFile, resolution, palette, invert);
                    }}
                />
                <PaletteDropdown
                    selectedOption={palette}
                    onOptionChange={(option) => {
                        if (!currentFile) {
                            return;
                        }
                        debounceOnresolutionChange(currentFile, specs.resolution, option, invert);
                        setPalette(option);
                    }}
                />

                <form>
                    <div className="checkboxes">
                        <label>
                            <input
                                type="checkbox"
                                checked={invert}
                                onChange={() => {
                                    if (!currentFile) {
                                        return;
                                    }
                                    debounceOnresolutionChange(
                                        currentFile,
                                        specs.resolution,
                                        palette,
                                        !invert,
                                    );
                                    setInvert(!invert);
                                }}
                            />
                            {'inverse?'}
                        </label>
                    </div>
                </form>

                <div className="menu-entry">
                    <label htmlFor="clipboard-button" className="clickable-button">
                        Save to clipboard
                    </label>

                    <button
                        id="clipboard-button"
                        className="hidden-button"
                        onClick={() => {
                            navigator.clipboard.writeText(ascii);
                        }}>
                        {'save to clipboard'}
                    </button>
                </div>
            </div>
            <pre>
                <div
                    className="ascii"
                    style={{
                        fontSize: `${specs.zoom * specs.fontSize}px`,
                        lineHeight: 1,
                    }}>{`${ascii}`}</div>
            </pre>
        </div>
    );
};

export default App;
