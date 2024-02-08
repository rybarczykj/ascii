import { getAsciiFromContext } from '../ascii-utils';

export const processVideoFrames = async (
    video: HTMLVideoElement,
    palette: string | string[],
    asciiResolution: number,
    isColorInverted: boolean,
    onVideoFramesChange: (frame: string[]) => void,
    contrast: number,
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
    if (!context || !video) return;

    const frames: string[] = [];

    const frameRate = 10; // Number of frames per second (adjust this based on performance)

    // Calculate the width and height for processing based on the original video's aspect ratio
    const aspectRatio = video.videoWidth / video.videoHeight;

    const width = asciiResolution;
    // 0.6 because the ascii characters are taller than they are wide
    const height = (0.6 * width) / aspectRatio;

    // Set the canvas dimensions to match the processing size
    context.canvas.width = width;
    context.canvas.height = height;

    const processFrame = async () => {
        context.drawImage(video, 0, 0, width, height);
        const frameAscii = getAsciiFromContext(context, palette, isColorInverted, contrast);
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

export async function getFirstFrameOfVideoAsImageFile(
    video: HTMLVideoElement,
): Promise<File | null> {
    return new Promise((resolve) => {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
            // Unable to get 2D context, return null
            resolve(null);
            return;
        }

        video.addEventListener('loadeddata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // TODO: this is called like 60 times, which might not be ideal.
            // but it's the only what i can get the video to actuall show
            // on the canvas
            const onCanPlay = () => {
                video.play();
                video.currentTime = 0.001;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // wait 2 seconds for good measure
                setTimeout(() => {
                    canvas.toBlob(async (blob) => {
                        if (!blob) {
                            resolve(null);
                            return;
                        }
                        const file = new File([blob], 'first-frame.jpeg', { type: 'image/jpeg' });
                        resolve(file);
                    }, 'image/jpeg');
                    video.removeEventListener('canplaythrough', onCanPlay);
                }, 1000);
            };

            // Attach the canplay event listener
            video.addEventListener('canplaythrough', onCanPlay);
        });

        // If the video is already loaded, trigger the event manually
        if (video.readyState >= 2) {
            video.dispatchEvent(new Event('loadeddata'));
        }
    });
}
