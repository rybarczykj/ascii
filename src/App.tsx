import './index.css';
import React from 'react';
import debounce from 'lodash.debounce';
import { resizeImage, getAsciiFromCanvas } from './ascii-utils';
import { Slider } from './Slider';

const ARTWIDTH = 700;

interface SpecsState {
    fontSize: number;
    resolution: number;
    letterSpacing: number;
    width: number;
    zoom: number;
}

const initialState = {
    fontSize: 30,
    resolution: 100,
    letterSpacing: 0,
    width: ARTWIDTH,
    zoom: 1,
};

function App() {
    const [ascii, setAscii] = React.useState('');
    const [currentFile, setCurrentFile] = React.useState<File>();
    const [specs, setSpecs] = React.useState<SpecsState>(initialState);
    const [zoom, setZoom] = React.useState(1);

    // I use to need to make this fun a ref but i'm not so sure anymore
    const onResolutionChange = (imageFile: File, newResolution: number) => {
        resizeImage({
            file: imageFile,
            maxSize: newResolution,
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
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            const myFile = event.target.files?.[0];
                            if (!myFile) {
                                return;
                            }
                            setCurrentFile(myFile);
                            debounceOnresolutionChange(myFile, initialState.resolution);
                        }}
                    />
                </div>
                <Slider
                    title={'zoom:'}
                    onChange={(event) => {
                        const newZoom = parseFloat(event.target.value);
                        setSpecs({ ...specs, zoom: newZoom });
                    }}
                    value={specs.zoom}
                    min={1}
                    max={10}
                    step={0.25}
                    label={specs.fontSize.toString().slice(0, 5)}
                />
                <Slider
                    title={'spacing between letters:'}
                    onChange={(event) => {
                        const letterSpacing = parseFloat(event.target.value);
                        setSpecs({ ...specs, letterSpacing: letterSpacing });
                    }}
                    value={specs.letterSpacing}
                    min={0}
                    max={4}
                    step={0.25}
                    label={specs.letterSpacing.toString().slice(0, 5)}
                />
                <Slider
                    title={'characters wide:'}
                    onChange={(event) => {
                        const resolution = parseFloat(event.target.value);
                        if (currentFile) {
                            debounceOnresolutionChange(currentFile, resolution);
                        }
                    }}
                    value={specs.resolution}
                    min={5}
                    max={500}
                    label={specs.resolution.toString().slice(0, 5)}
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
                        letterSpacing: specs.letterSpacing,
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: -1,
                    }}>{`${ascii}`}</div>
            </pre>
        </div>
    );
}

export default App;
