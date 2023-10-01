import { getAsciiFromContext } from '../ascii-utils';

export const processVideoFrames = async (
    video: HTMLVideoElement,
    palette: string | string[],
    asciiResolution: number,
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
    const context = canvas.getContext('2d', {
        willReadFrequently: true,
    });
    const frames: string[] = [];

    const frameRate = 10; // Number of frames per second (adjust this based on performance)

    // Calculate the width and height for processing based on the original video's aspect ratio
    const aspectRatio = video.videoWidth / video.videoHeight;

    const width = asciiResolution;
    // 0.6 because the ascii characters are taller than they are wide
    const height = (0.6 * width) / aspectRatio;

    // Set the canvas dimensions to match the processing size
    canvas.width = width;
    canvas.height = height;

    const processFrame = async () => {
        if (!context || !video) return;

        context.drawImage(video, 0, 0, width, height);
        const frameAscii = getAsciiFromContext(context, width, height, palette, isColorInverted);
        frames.push(frameAscii);

        if (!video.paused && !video.ended && !(video.currentTime >= video.duration)) {
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
