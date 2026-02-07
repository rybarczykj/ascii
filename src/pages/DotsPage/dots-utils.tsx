// Dots-specific utilities
import { getGreyscale, getColors, getRawColors, resizeImage } from '../../shared/utils';
import { applyBrightness, applyContrast, applyGamma, calculateLuminance } from '../../shared/utils/color-utils';

// Re-export shared utilities
export { getGreyscale, getColors, getRawColors, resizeImage };
export { applyBrightness, applyContrast, applyGamma, calculateLuminance };

export interface ProcessedPixelData {
    pixels: { r: number; g: number; b: number }[][];
    /** Original unmodified colors (before contrast/brightness/inversion) */
    originalPixels: { r: number; g: number; b: number }[][];
    width: number;
    height: number;
}

/**
 * Process image data for dots rendering
 * Returns a 2D array of RGB values with contrast, brightness, and gamma applied
 */
export const processImageForDots = (
    imageData: ImageData,
    contrast: number,
    brightness: number,
    gamma: number,
    isColorInverted: boolean,
    useColors: boolean
): ProcessedPixelData => {
    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const result: { r: number; g: number; b: number }[][] = [];
    const originalResult: { r: number; g: number; b: number }[][] = [];

    for (let y = 0; y < height; y++) {
        const row: { r: number; g: number; b: number }[] = [];
        const originalRow: { r: number; g: number; b: number }[] = [];
        for (let x = 0; x < width; x++) {
            const pixelIndex = (y * width + x) * 4;
            const origR = pixels[pixelIndex];
            const origG = pixels[pixelIndex + 1];
            const origB = pixels[pixelIndex + 2];
            
            // Store original colors
            originalRow.push({ r: origR, g: origG, b: origB });
            
            let r = origR;
            let g = origG;
            let b = origB;

            if (useColors) {
                // Apply adjustments to each channel: brightness → contrast → gamma
                const luminance = calculateLuminance(r, g, b);
                const adjustedLuminance = applyGamma(
                    applyContrast(applyBrightness(luminance, brightness), contrast),
                    gamma
                );
                
                // Scale RGB values by the luminance adjustment factor
                const factor = luminance > 0 ? adjustedLuminance / luminance : 1;
                r = Math.min(255, Math.max(0, Math.round(r * factor)));
                g = Math.min(255, Math.max(0, Math.round(g * factor)));
                b = Math.min(255, Math.max(0, Math.round(b * factor)));

                if (isColorInverted) {
                    r = 255 - r;
                    g = 255 - g;
                    b = 255 - b;
                }
            } else {
                // Greyscale mode: brightness → contrast → gamma
                const luminance = calculateLuminance(r, g, b);
                const adjustedLuminance = applyGamma(
                    applyContrast(applyBrightness(luminance, brightness), contrast),
                    gamma
                );
                const grey = isColorInverted ? 255 - adjustedLuminance : adjustedLuminance;
                r = g = b = Math.round(grey);
            }

            row.push({ r, g, b });
        }
        result.push(row);
        originalResult.push(originalRow);
    }

    return { pixels: result, originalPixels: originalResult, width, height };
};

