// ASCII-specific utilities (uses shared utilities)
import { getGreyscale as sharedGetGreyscale, getColors as sharedGetColors, resizeImage as sharedResizeImage } from '../../shared/utils';

// Re-export shared utilities for backward compatibility
export const getGreyscale = sharedGetGreyscale;
export const getColors = sharedGetColors;
export const resizeImage = sharedResizeImage;

/**
 * Get ASCII art from a canvas context
 */
export const getAsciiFromContext = (
    context: CanvasRenderingContext2D,
    asciiChars: string | string[],
    inverse = false,
    contrast: number,
    brightness: number,
): string => {
    const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    const greyscale = getGreyscale(imageData);
    const ascii = getAsciiFromGreyscale(greyscale, asciiChars, inverse, contrast, brightness);
    return ascii;
};

/**
 * Convert greyscale values to ASCII characters
 */
export const getAsciiFromGreyscale = (
    greyscale: number[][],
    asciiChars: string | string[],
    inverse = false,
    contrast: number,
    brightness: number,
): string => {
    let ascii = '';
    for (let y = 0; y < greyscale.length; y++) {
        for (let x = 0; x < greyscale[y].length; x++) {
            const luminance = greyscale[y][x];

            const adjustedLuminance = brightness
                ? Math.max(Math.min(luminance + brightness, 255), 0)
                : luminance;

            const contrastedLuminance = contrast
                ? Math.max(Math.min((adjustedLuminance - 127.5) * contrast, 255), 0)
                : adjustedLuminance;

            const asciiIndex = Math.floor((contrastedLuminance / 255) * (asciiChars.length - 1));
            if (inverse) {
                ascii += asciiChars[asciiChars.length - asciiIndex - 1];
            } else {
                ascii += asciiChars[asciiIndex];
            }
        }
        ascii += '\n';
    }
    return ascii;
};

/**
 * Convert greyscale values to colored ASCII characters
 */
export const getColoredAsciiFromGreyscale = (
    greyscale: number[][],
    colors: string[][],
    asciiChars: string | string[],
    inverse = false,
    contrast: number,
    brightness: number,
): { ascii: string; colors: string[] } => {
    let ascii = '';
    const colorArray: string[] = [];

    for (let y = 0; y < greyscale.length; y++) {
        for (let x = 0; x < greyscale[y].length; x++) {
            const luminance = greyscale[y][x];
            const color = colors[y][x];

            const adjustedLuminance = brightness
                ? Math.max(Math.min(luminance + brightness, 255), 0)
                : luminance;

            const contrastedLuminance = contrast
                ? Math.max(Math.min((adjustedLuminance - 127.5) * contrast, 255), 0)
                : adjustedLuminance;

            const asciiIndex = Math.floor((contrastedLuminance / 255) * (asciiChars.length - 1));
            const char = inverse
                ? asciiChars[asciiChars.length - asciiIndex - 1]
                : asciiChars[asciiIndex];

            ascii += char;
            colorArray.push(color);
        }
        ascii += '\n';
        colorArray.push(''); // empty color for newline
    }
    return { ascii, colors: colorArray };
};

