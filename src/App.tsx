import './index.css';
import React from 'react';
import { MenuContainer as Menu } from './Menu';
import { AsciiVideo } from './video/asciiVideo';

//rewrite as enum?

export const Fonts = [
    'Ibm Plex Mono',
    'Azeret Mono',
    'Space Mono',
    'Roboto Mono',
    'Courier New',
    'Monaco',
];

export type Font = (typeof Fonts)[number];

export interface SpecsState {
    fontSize: number;
    resolution: number;
    width: number;
    zoom: number;
    weight: number;
    fontFamily: Font;
}

const App: React.FC = () => {
    const [ascii, setAscii] = React.useState<string | string[]>('');
    const [specs, setSpecs] = React.useState<SpecsState>({
        fontSize: 30,
        resolution: 100,
        width: 700,
        zoom: 1,
        weight: 400,
        fontFamily: 'Ibm Plex Mono',
    });
    console.log('specs', specs);

    // TODO: why isn't the size of the video fixed anymore? and when did it break?
    return (
        <div className="flex-container">
            <Menu
                specs={specs}
                onSpecsChange={(specs: SpecsState) => setSpecs(specs)}
                onAsciiChange={(ascii: string | string[]) => setAscii(ascii)}
                onCopy={() => {
                    navigator.clipboard.writeText(
                        typeof ascii === 'string' ? ascii : JSON.stringify(ascii),
                    );
                }}
            />
            <pre>
                <div
                    className="ascii"
                    style={{
                        fontSize: `${specs.zoom * 7}px`,
                        lineHeight: 1,
                        fontWeight: specs.weight,
                        fontFamily: specs.fontFamily,
                    }}>
                    {ascii !== '' ? (
                        typeof ascii === 'string' ? (
                            ascii
                        ) : (
                            <AsciiVideo asciiFrames={ascii} />
                        )
                    ) : (
                        '{(-.-)/^'
                    )}
                </div>
            </pre>
        </div>
    );
};

export default App;
