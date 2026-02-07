import { Slider } from '../Slider';
import React from 'react';
import { SpecsState } from '../../types';

interface SliderSectionProps {
    specs: SpecsState;
    onSpecsChange: (specs: SpecsState) => void;
    onResolutionChange: (resolution: number) => void;
    contrast: number;
    onContrastChange: (contrast: number) => void;
    brightness: number;
    onBrightnessChange: (brightness: number) => void;
    /** Whether to show font weight slider (ASCII mode only) */
    showFontWeight?: boolean;
    /** Gamma (Dots mode). When provided, shows gamma slider. */
    gamma?: number;
    onGammaChange?: (gamma: number) => void;
}

export const SliderSection: React.FC<SliderSectionProps> = ({
    specs,
    onSpecsChange,
    onResolutionChange,
    contrast,
    onContrastChange,
    brightness,
    onBrightnessChange,
    showFontWeight = true,
    gamma,
    onGammaChange,
}) => {
    return (
        <>
            <Slider
                title={'resolution:'}
                onChange={(resolution) => {
                    onResolutionChange(resolution);
                }}
                value={specs.resolution}
                min={5}
                max={500}
                label={specs.resolution.toString().slice(0, 5)}
            />

            <Slider
                title={'contrast:'}
                onChange={(newContrast) => {
                    onContrastChange(newContrast);
                }}
                value={contrast}
                min={0.1}
                max={50}
                step={0.1}
                label={contrast.toString()}
            />

            <Slider
                title={'brightness:'}
                onChange={(newBrightness) => {
                    onBrightnessChange(newBrightness);
                }}
                value={brightness}
                min={-255}
                max={255}
                step={1}
                label={brightness.toString()}
            />

            {gamma !== undefined && onGammaChange && (
                <Slider
                    title={'gamma:'}
                    onChange={onGammaChange}
                    value={gamma}
                    min={0.4}
                    max={2.5}
                    step={0.1}
                    label={gamma.toFixed(1)}
                />
            )}

            <Slider
                title={'zoom:'}
                onChange={(newZoom) => {
                    onSpecsChange({ ...specs, zoom: newZoom });
                }}
                value={specs.zoom}
                min={0.1}
                max={10}
                step={0.1}
                label={specs.zoom.toString().slice(0, 4)}
            />

            {showFontWeight && (
                <Slider
                    title={'font weight:'}
                    onChange={(newWeight) => {
                        onSpecsChange({ ...specs, weight: newWeight });
                    }}
                    value={specs.weight}
                    min={0}
                    max={800}
                    label={specs.weight.toString()}
                />
            )}
        </>
    );
};

