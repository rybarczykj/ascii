import { Slider } from './Slider';
import React from 'react';
import { SpecsState } from './App';

export const SliderSection: React.FC<{
    // eslint-disable-next-line
    specs: any;
    onSpecsChange: (specs: SpecsState) => void;
    onResolutionChange: (resolution: number) => void;
}> = ({ specs, onSpecsChange, onResolutionChange }) => {
    return (
        <>
            <Slider
                title={'zoom:'}
                onChange={(event) => {
                    const newZoom = parseFloat(event.target.value);
                    onSpecsChange({ ...specs, zoom: newZoom });
                }}
                value={specs.zoom}
                min={1}
                max={10}
                step={0.25}
                label={specs.fontSize.toString().slice(0, 5)}
            />

            <Slider
                title={'characters wide:'}
                onChange={(event) => {
                    const resolution = parseFloat(event.target.value);
                    onResolutionChange(resolution);
                }}
                value={specs.resolution}
                min={5}
                max={500}
                label={specs.resolution.toString().slice(0, 5)}
            />
        </>
    );
};
