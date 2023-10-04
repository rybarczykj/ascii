import './index.css';
import React from 'react';
import debounce from 'lodash.debounce';
import { resizeImage, getAsciiFromCanvas } from './ascii-utils';
import { ASCIICHARS } from './PaletteDropdown';
import { Menu } from './Menu';
import { processVideoFrames } from './video/process-video';
import { AsciiVideo } from './video/asciiVideo';
import { isEmpty } from 'lodash';

const ARTWIDTH = 700;

export interface SpecsState {
    fontSize: number;
    resolution: number;
    width: number;
    zoom: number;
    weight: number;
}

const initialState = {
    fontSize: 30,
    resolution: 100,
    width: ARTWIDTH,
    zoom: 1,
    weight: 400,
};

const App: React.FC = () => {
    const [ascii, setAscii] = React.useState('');
    const [currentFile, setCurrentFile] = React.useState<File>();
    const [specs, setSpecs] = React.useState<SpecsState>(initialState);

    const [videoFrames, setVideoFrames] = React.useState<string[]>([]);

    const [palette, setPalette] = React.useState<string | string[]>(ASCIICHARS[0]);

    const [isColorInverted, setInvert] = React.useState(false);

    const onResolutionChange = (
        imageFile: File,
        newResolution: number,
        palette: string | string[],
        isColorInverted: boolean,
    ) => {
        resizeImage({
            file: imageFile,
            maxWidth: newResolution,
        }).then((canvas) => {
            const newAscii = getAsciiFromCanvas(canvas, palette, isColorInverted);
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
        (file: File, resolution, palette, isColorInverted) =>
            onResolutionChange(file, resolution, palette, isColorInverted),
        0,
    );

    return (
        <div className="flex-container">
            <Menu
                onFileUpload={(myFile: File) => {
                    setCurrentFile(myFile);
                    // reset video frames as well
                    setVideoFrames([]);
                    debounceOnresolutionChange(
                        myFile,
                        initialState.resolution,
                        palette,
                        isColorInverted,
                    );
                }}
                onVideoUpload={(videoFile: File) => {
                    setCurrentFile(videoFile);

                    const video = document.createElement('video');
                    video.src = URL.createObjectURL(videoFile);

                    // reset ascii as well
                    setAscii('');

                    processVideoFrames(
                        video,
                        palette,
                        specs.resolution,
                        isColorInverted,
                        (frames) => {
                            setVideoFrames(frames);
                        },
                    );
                }}
                onResolutionChange={(resolution: number) => {
                    if (!currentFile) {
                        return;
                    }
                    if (!isEmpty(videoFrames)) {
                        const video = document.createElement('video');
                        video.src = URL.createObjectURL(currentFile);
                        processVideoFrames(
                            video,
                            palette,
                            resolution,
                            isColorInverted,
                            setVideoFrames,
                        );
                    } else {
                        debounceOnresolutionChange(
                            currentFile,
                            resolution,
                            palette,
                            isColorInverted,
                        );
                    }
                }}
                specs={specs}
                onSpecsChange={(specs: SpecsState) => setSpecs(specs)}
                palette={palette}
                onPaletteChange={(newPalette) => {
                    // TODO refactor these onChanges for less code duupe
                    setPalette(newPalette);
                    if (!currentFile) {
                        return;
                    }
                    if (!isEmpty(videoFrames)) {
                        const video = document.createElement('video');
                        video.src = URL.createObjectURL(currentFile);
                        processVideoFrames(
                            video,
                            newPalette,
                            specs.resolution,
                            isColorInverted,
                            setVideoFrames,
                        );
                    } else {
                        debounceOnresolutionChange(
                            currentFile,
                            specs.resolution,
                            newPalette,
                            isColorInverted,
                        );
                    }
                }}
                isColorInverted={isColorInverted}
                onColorInvertedToggle={() => {
                    if (!currentFile) {
                        return;
                    }
                    debounceOnresolutionChange(
                        currentFile,
                        specs.resolution,
                        palette,
                        !isColorInverted,
                    );
                    setInvert(!isColorInverted);
                }}
                onCopy={() => {
                    navigator.clipboard.writeText(
                        !isEmpty(videoFrames) ? JSON.stringify(videoFrames) : ascii,
                    );
                }}
            />
            <pre>
                <div
                    className="ascii"
                    style={{
                        fontSize: `${specs.zoom * specs.fontSize}px`,
                        lineHeight: 1,
                        fontWeight: specs.weight,
                    }}>
                    {ascii !== '' ? (
                        `${ascii}`
                    ) : !isEmpty(videoFrames) ? (
                        <AsciiVideo asciiFrames={videoFrames} />
                    ) : (
                        '{(-.-)/^'
                    )}
                </div>
            </pre>
        </div>
    );
};

export default App;
