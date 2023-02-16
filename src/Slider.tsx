import React from 'react';

interface SliderProps {
    title: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    label: string;
    value: any;
    min: number;
    max: number;
    step?: number;
}

export const Slider: React.FC<SliderProps> = ({
    title,
    onChange,
    label,
    value,
    min,
    max,
    step,
}) => {
    return (
        <div className="slidecontainer">
            <p>{title}</p>
            <input
                type="range"
                min={min}
                max={max}
                className="slider"
                value={value}
                onChange={onChange}
                step={step}
            />
            <output>{label}</output>
        </div>
    );
};
