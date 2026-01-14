// Shared image processing utilities

/**
 * Extract greyscale luminance values from image data
 * Uses perceived luminance according to https://en.wikipedia.org/wiki/Relative_luminance
 */
export const getGreyscale = (data: ImageData): number[][] => {
    const pixels = data.data;

    const greyscale: number[][] = [];
    for (let y = 0; y < data.height; y++) {
        const greyscaleRow: number[] = [];
        for (let x = 0; x < data.width; x++) {
            const pixelIndex = (y * data.width + x) * 4;
            const luminance =
                0.2126 * pixels[pixelIndex] +
                0.7152 * pixels[pixelIndex + 1] +
                0.0722 * pixels[pixelIndex + 2];

            greyscaleRow.push(luminance);
        }
        greyscale.push(greyscaleRow);
    }
    return greyscale;
};

/**
 * Extract RGB color values from image data as CSS color strings
 */
export const getColors = (data: ImageData): string[][] => {
    const pixels = data.data;
    const colors: string[][] = [];

    for (let y = 0; y < data.height; y++) {
        const colorRow: string[] = [];
        for (let x = 0; x < data.width; x++) {
            const pixelIndex = (y * data.width + x) * 4;
            const r = pixels[pixelIndex];
            const g = pixels[pixelIndex + 1];
            const b = pixels[pixelIndex + 2];
            const color = `rgb(${r}, ${g}, ${b})`;
            colorRow.push(color);
        }
        colors.push(colorRow);
    }
    return colors;
};

/**
 * Extract raw RGB values from image data
 */
export const getRawColors = (data: ImageData): { r: number; g: number; b: number }[][] => {
    const pixels = data.data;
    const colors: { r: number; g: number; b: number }[][] = [];

    for (let y = 0; y < data.height; y++) {
        const colorRow: { r: number; g: number; b: number }[] = [];
        for (let x = 0; x < data.width; x++) {
            const pixelIndex = (y * data.width + x) * 4;
            colorRow.push({
                r: pixels[pixelIndex],
                g: pixels[pixelIndex + 1],
                b: pixels[pixelIndex + 2],
            });
        }
        colors.push(colorRow);
    }
    return colors;
};

interface IResizeImageOptions {
    maxWidth: number;
    file: File;
    /** Multiplier for height to compensate for non-square pixels/characters. Default 0.6 for ASCII, use 1.0 for dots */
    aspectRatioMultiplier?: number;
}

const resize = (image: HTMLImageElement, maxHeight: number, canvas: HTMLCanvasElement, aspectRatioMultiplier: number) => {
    let width = image.width;
    let height = image.height;

    if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
    }
    // Apply aspect ratio multiplier (0.6 for ASCII because characters are taller than wide, 1.0 for dots)
    height *= aspectRatioMultiplier;

    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context?.drawImage(image, 0, 0, width, height);
    return canvas;
};

/**
 * Resize an image file to a maximum width, maintaining aspect ratio
 * Returns a Canvas with the image resized
 */
export const resizeImage = (settings: IResizeImageOptions): Promise<HTMLCanvasElement> => {
    const file = settings.file;
    const maxWidth = settings.maxWidth;
    const aspectRatioMultiplier = settings.aspectRatioMultiplier ?? 0.6;
    const reader = new FileReader();
    const image = new Image();
    const canvas = document.createElement('canvas');

    return new Promise<HTMLCanvasElement>((ok, no) => {
        if (!file.type.match(/image.*/)) {
            no(new Error('Not an image'));
            return;
        }

        reader.onload = (readerEvent: ProgressEvent<FileReader>) => {
            image.onload = () => ok(resize(image, maxWidth, canvas, aspectRatioMultiplier));
            image.src = readerEvent.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
};

