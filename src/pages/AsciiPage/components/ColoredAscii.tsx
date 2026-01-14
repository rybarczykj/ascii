import React from 'react';

interface ColoredAsciiProps {
    ascii: string;
    colors: string[];
    style: React.CSSProperties;
}

export const ColoredAscii: React.FC<ColoredAsciiProps> = ({ ascii, colors, style }) => {
    const lines = ascii.split('\n');
    let colorIndex = 0;

    return (
        <div className="ascii" style={style}>
            {lines.map((line, lineIndex) => (
                <div key={lineIndex}>
                    {line.split('').map((char, charIndex) => {
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

