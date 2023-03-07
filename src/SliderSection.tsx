import { Slider } from './Slider';
import React from 'react';

export const SliderSection: React.FC<{
    specs: any;
    setSpecs: (state: any) => void;
    onResolutionChange: (newResolution: number) => void;
}> = ({ specs, setSpecs, onResolutionChange }) => {
    return (
        <>
            <Slider
                title={'zoom:'}
                onChange={(event) => {
                    const newZoom = parseFloat(event.target.value);
                    setSpecs({ ...specs, zoom: newZoom });
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
