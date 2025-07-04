import './index.css';
import React from 'react';
import { MenuContainer as Menu } from './ui/Menu/Menu';
import { AsciiVideo } from './video/asciiVideo';

//rewrite as enum?

export const Fonts = [
    'Ibm Plex Mono',
    'Azeret Mono',
    'Space Mono',
    'Roboto Mono',
    'Courier New',
    'Monaco',
    'Arial',
    'Helvetica',
];

export type Font = (typeof Fonts)[number];

export interface SpecsState {
    fontSize: number;
    resolution: number;
    width: number;
    zoom: number;
    weight: number;
    fontFamily: Font;
    kerning: number;
    lineHeight: number;
}

interface ColoredAsciiProps {
    ascii: string;
    colors: string[];
    style: React.CSSProperties;
}

const ColoredAscii: React.FC<ColoredAsciiProps> = ({ ascii, colors, style }) => {
    const lines = ascii.split('\n');
    let colorIndex = 0;

    return (
        <div className="ascii" style={style}>
            {lines.map((line, lineIndex) => (
                <div key={lineIndex}>
                    {line.split('').map((char, charIndex) => {
                        // Find the next non-empty color (skip newline placeholders)
                        let color = 'inherit';
                        while (colorIndex < colors.length && colors[colorIndex] === '') {
                            colorIndex++;
                        }
                        if (colorIndex < colors.length) {
                            color = colors[colorIndex];
                            colorIndex++;
                        }
                        return (
                            <span key={charIndex} style={{ color }}>
                                {char}
                            </span>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

const App: React.FC = () => {
    const [ascii, setAscii] = React.useState<string | string[] | { ascii: string; colors: string[] }[]>('');
    const [asciiColors, setAsciiColors] = React.useState<string[]>([]);
    const [specs, setSpecs] = React.useState<SpecsState>({
        fontSize: 30,
        resolution: 100,
        width: 700,
        zoom: 1,
        weight: 400,
        fontFamily: 'Ibm Plex Mono',
        kerning: 0,
        lineHeight: 1,
    });
    console.log('specs', specs);

    const lineHeight = 1000 / specs.resolution;
    console.log('ascii', ascii.slice(0, 100));

    const handleAsciiChange = (asciiData: string | string[] | { ascii: string; colors: string[] }[], resolution: number, colors?: string[]) => {
        if (typeof asciiData === 'string') {
            setAscii(asciiData);
            setAsciiColors(colors || []);
        } else if (Array.isArray(asciiData) && asciiData.length > 0 && typeof asciiData[0] === 'string') {
            // Regular video frames
            setAscii(asciiData as string[]);
            setAsciiColors([]);
        } else if (Array.isArray(asciiData) && asciiData.length > 0 && typeof asciiData[0] === 'object') {
            // Colored video frames
            setAscii(asciiData as { ascii: string; colors: string[] }[]);
            setAsciiColors([]);
        } else {
            setAscii(asciiData);
            setAsciiColors([]);
        }
    };

    return (
        <div className="flex-container">
            <Menu
                specs={specs}
                onSpecsChange={(specs: SpecsState) => setSpecs(specs)}
                onAsciiChange={handleAsciiChange}
                onCopy={() => {
                    navigator.clipboard.writeText(
                        typeof ascii === 'string' ? ascii : JSON.stringify(ascii),
                    );
                }}
            />
            <pre>
                {ascii !== '' ? (
                    typeof ascii === 'string' ? (
                        asciiColors.length > 0 ? (
                            <ColoredAscii
                                ascii={ascii}
                                colors={asciiColors}
                                style={{
                                    fontSize: `${lineHeight * 1 * specs.zoom}px`,
                                    lineHeight: `${lineHeight * specs.zoom}px`,
                                    fontWeight: specs.weight,
                                    fontFamily: specs.fontFamily,
                                    letterSpacing: `${specs.kerning}px`,
                                }}
                            />
                        ) : (
                            <div
                                className="ascii"
                                style={{
                                    fontSize: `${lineHeight * 1 * specs.zoom}px`,
                                    lineHeight: `${lineHeight * specs.zoom}px`,
                                    fontWeight: specs.weight,
                                    fontFamily: specs.fontFamily,
                                    letterSpacing: `${specs.kerning}px`,
                                }}>
                                {ascii}
                            </div>
                        )
                    ) : (
                        <div
                            className="ascii"
                            style={{
                                fontSize: `${lineHeight * 1 * specs.zoom}px`,
                                lineHeight: `${lineHeight * specs.zoom}px`,
                                fontWeight: specs.weight,
                                fontFamily: specs.fontFamily,
                                letterSpacing: `${specs.kerning}px`,
                            }}>
                            <AsciiVideo
                                asciiFrames={ascii as string[] | { ascii: string; colors: string[] }[]}
                                style={{
                                    fontSize: `${lineHeight * 1 * specs.zoom}px`,
                                    lineHeight: `${lineHeight * specs.zoom}px`,
                                    fontWeight: specs.weight,
                                    fontFamily: specs.fontFamily,
                                    letterSpacing: `${specs.kerning}px`,
                                }}
                            />
                        </div>
                    )
                ) : (
                    <div
                        className="ascii"
                        style={{
                            fontSize: `${lineHeight * 1 * specs.zoom}px`,
                            lineHeight: `${lineHeight * specs.zoom}px`,
                            fontWeight: specs.weight,
                            fontFamily: specs.fontFamily,
                            letterSpacing: `${specs.kerning}px`,
                        }}>
                        &apos;((-.-)/^&apos;
                    </div>
                )}
            </pre>
        </div>
    );
};

export default App;
