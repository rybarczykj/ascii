import { getAsciiFromCanvas } from '../ascii-utils';

export const processVideoFrames = async (
    video: HTMLVideoElement,
    maxwidth: number,
    palette: string | string[],
    isColorInverted: boolean,
    onVideoFramesChange: (frame: string[]) => void,
) => {
    // Wait for video metadata to load
    await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
            resolve();
        };
    });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const frames: string[] = [];

    const frameRate = 5; // Number of frames per second (adjust this based on performance)

    // Calculate the width and height for processing based on the original video's aspect ratio
    const aspectRatio = video.videoWidth / video.videoHeight;
    const width = 100; // Adjust this for the desired width of ASCII frames
    const height = width / aspectRatio;

    // Set the canvas dimensions to match the processing size
    canvas.width = width;
    canvas.height = height;

    const processFrame = async () => {
        if (!context || !video) return;

        context.drawImage(video, 0, 0, width, height);
        // TODO: what is this??
        // const dataURL = canvas.toDataURL();
        const frameAscii = await getAsciiFromCanvas(canvas, palette, isColorInverted); // Create a new function getAsciiFromDataURL to convert data URL to ASCII art
        frames.push(frameAscii);

        if (!video.paused && !video.ended) {
            setTimeout(processFrame, 1000 / frameRate);
            video.currentTime += 1 / frameRate;
        } else {
            // Video processing is done
            onVideoFramesChange(frames);
        }
    };

    // Start video playback and frame processing
    video.currentTime = 0;
    await video.play();
    processFrame();
};
