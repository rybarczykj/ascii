import React from 'react';

export const AsciiVideo = ({
    asciiFrames,
    frameRate,
}: {
    asciiFrames: string[];
    frameRate: number;
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

    return <div>{asciiFrames[currentFrameIndex]}</div>;
};
