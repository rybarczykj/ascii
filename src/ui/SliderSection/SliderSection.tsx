import { Slider } from '../Slider/Slider';
import React from 'react';
import { SpecsState } from '../../App';
import { on } from 'events';

export const SliderSection: React.FC<{
    specs: SpecsState;
    onSpecsChange: (specs: SpecsState) => void;
    onResolutionChange: (resolution: number) => void;
    contrast: number;
    onContrastChange: (contrast: number) => void;
}> = ({ specs, onSpecsChange, onResolutionChange, contrast, onContrastChange }) => {
    // TODO: consider using an exponential scale for resolution
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
                title={'zoom:'}
                onChange={(newZoom) => {
                    onSpecsChange({ ...specs, zoom: newZoom });
                }}
                value={specs.zoom}
                min={1}
                max={10}
                step={0.25}
                label={specs.zoom.toString().slice(0, 4)}
            />

            <Slider
                title={'weight:'}
                onChange={(newWeight) => {
                    onSpecsChange({ ...specs, weight: newWeight });
                }}
                value={specs.weight}
                min={0}
                max={800}
                label={specs.weight.toString()}
            />

            <Slider
                title={'contrast:'}
                onChange={(newContrast) => {
                    onContrastChange(newContrast);
                }}
                value={contrast}
                min={0.1}
                max={20}
                step={0.1}
                label={contrast.toString()}
            />

            <Slider
                title={'kerning:'}
                onChange={(newKerning) => {
                    onSpecsChange({ ...specs, kerning: newKerning });
                }}
                value={specs.kerning}
                min={-10}
                max={10}
                label={specs.kerning.toString()}
            />
            {/* <Slider
                title={'line height:'}
                onChange={(newLineHeight) => {
                    onSpecsChange({ ...specs, lineHeight: newLineHeight });
                }}
                value={specs.lineHeight}
                min={0.1}
                max={200}
                step={0.1}
                label={specs.lineHeight.toString()}
            /> */}
        </>
    );
};
