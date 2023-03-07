import './index.css';
import React from 'react';
import debounce from 'lodash.debounce';
import { resizeImage, getAsciiFromCanvas } from './ascii-utils';
import { Slider } from './Slider';
import { SliderSection } from './SliderSection';

const ARTWIDTH = 700;

interface SpecsState {
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

function App() {
    const [ascii, setAscii] = React.useState('');
    const [currentFile, setCurrentFile] = React.useState<File>();
    const [specs, setSpecs] = React.useState<SpecsState>(initialState);

    const onResolutionChange = (imageFile: File, newResolution: number) => {
        if (!imageFile) {
            return;
        }

        resizeImage({
            file: imageFile,
            maxWidth: newResolution,
        }).then((canvas) => {
            const newAscii = getAsciiFromCanvas(canvas);
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
        (file: File, spec) => onResolutionChange(file, spec),
        0,
    );

    return (
        <div className="flex-container">
            <div className="menu">
                <div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                            const myFile = event.target.files?.[0];
                            if (!myFile) {
                                return;
                            }
                            setCurrentFile(myFile);
                            debounceOnresolutionChange(myFile, initialState.resolution);
                        }}
                    />
                </div>
                <SliderSection
                    specs={specs}
                    setSpecs={setSpecs}
                    onResolutionChange={(resolution) => {
                        if (!currentFile) {
                            return;
                        }
                        debounceOnresolutionChange(currentFile, resolution);
                    }}
                />

                <div style={{ padding: '20px' }}>
                    <button
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
}

export default App;
