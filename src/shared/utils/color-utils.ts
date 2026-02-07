// Shared color processing utilities

/**
 * Apply brightness adjustment to a luminance value
 * @param luminance - The input luminance (0-255)
 * @param brightness - Brightness adjustment (-255 to 255)
 * @returns Adjusted luminance clamped to 0-255
 */
export const applyBrightness = (luminance: number, brightness: number): number => {
    if (!brightness) return luminance;
    return Math.max(Math.min(luminance + brightness, 255), 0);
};

/**
 * Apply contrast adjustment to a luminance value
 * @param luminance - The input luminance (0-255)
 * @param contrast - Contrast multiplier (0.1 to 50)
 * @returns Adjusted luminance clamped to 0-255
 */
export const applyContrast = (luminance: number, contrast: number): number => {
    if (!contrast) return luminance;
    return Math.max(Math.min((luminance - 127.5) * contrast + 127.5, 255), 0);
};

/**
 * Apply gamma curve to a luminance value (after brightness/contrast).
 * @param luminance - The input luminance (0-255)
 * @param gamma - Gamma exponent (e.g. 0.4–2.5). 1 = no change; <1 brightens midtones, >1 darkens midtones.
 * @returns Adjusted luminance clamped to 0-255
 */
export const applyGamma = (luminance: number, gamma: number): number => {
    if (gamma === 1 || gamma <= 0) return luminance;
    const x = luminance / 255;
    const y = Math.pow(x, gamma);
    return Math.max(0, Math.min(255, Math.round(y * 255)));
};

/**
 * Calculate perceived luminance from RGB values
 * Uses standard relative luminance formula
 */
export const calculateLuminance = (r: number, g: number, b: number): number => {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Apply brightness and contrast adjustments to a luminance value
 * @param luminance - The input luminance (0-255)
 * @param brightness - Brightness adjustment (-255 to 255)
 * @param contrast - Contrast multiplier (0.1 to 50)
 * @returns Adjusted luminance clamped to 0-255
 */
export const adjustLuminance = (
    luminance: number,
    brightness: number,
    contrast: number
): number => {
    const withBrightness = applyBrightness(luminance, brightness);
    return applyContrast(withBrightness, contrast);
};

/**
 * Invert a color value
 */
export const invertValue = (value: number): number => {
    return 255 - value;
};


