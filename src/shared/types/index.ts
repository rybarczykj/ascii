// Shared types for ASCII and Dots pages

export const Fonts = [
    'Ibm Plex Mono',
    'Azeret Mono',
    'Space Mono',
    'Roboto Mono',
    'Courier New',
    'Monaco',
    'Arial',
    'Helvetica',
] as const;

export type Font = (typeof Fonts)[number];

export interface SpecsState {
    fontSize: number;
    resolution: number;
    width: number;
    zoom: number;
    weight: number;
    fontFamily: Font;
    kerning: number;
    lineHeight: number;
}

export interface VisualSettings {
    palette: string | string[];
    isColorInverted: boolean;
    useColors: boolean;
    contrast: number;
    brightness: number;
}

export interface FileUploadHandlers {
    onImageUpload: (file: File) => void;
    onVideoUpload: (file: File) => void;
}


