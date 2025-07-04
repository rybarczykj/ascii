import React from 'react';

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

export const AsciiVideo = ({
    asciiFrames,
    frameRate = 10,
    style,
}: {
    asciiFrames: string[] | { ascii: string; colors: string[] }[];
    // the frame rate to play the video at (has nothing to do with video creation)
    frameRate?: number;
    style?: React.CSSProperties;
}): JSX.Element | null => {
    if (asciiFrames.length == 0) {
        return null;
    }
    const [currentFrameIndex, setCurrentFrameIndex] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFrameIndex((prevIndex) => (prevIndex + 1) % asciiFrames.length);
        }, 1000 / frameRate);

        return () => clearInterval(interval);
    }, [asciiFrames.length, frameRate]);

    const currentFrame = asciiFrames[currentFrameIndex];

    if (typeof currentFrame === 'string') {
        return <div style={style}>{currentFrame}</div>;
    } else {
        return (
            <ColoredAscii
                ascii={currentFrame.ascii}
                colors={currentFrame.colors}
                style={style || {}}
            />
        );
    }
};
