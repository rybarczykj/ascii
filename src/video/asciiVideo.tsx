import React from 'react';

export const AsciiVideo = ({
    asciiFrames,
    frameRate = 10,
}: {
    asciiFrames: string[];
    // the frame rate to play the video at (has nothing to do with video creation)
    frameRate?: number;
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
