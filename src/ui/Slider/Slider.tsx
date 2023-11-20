import React from 'react';

interface SliderProps {
    title: string;
    onChange: (newValue: number) => void;
    label: string;
    // eslint-disable-next-line
    value: any;
    min: number;
    max: number;
    step?: number;
    disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
    title,
    onChange,
    label,
    value,
    min,
    max,
    step,
    disabled,
}) => {
    const sliderLength = 10;
    if (value > max || value < min) {
        throw new Error(`value ${value} is outside of range ${min} to ${max}`);
    }

    const normalizedValue = Math.floor(((value - min) / (max - min)) * sliderLength);

    const leftDashes = '-'.repeat(normalizedValue);
    const rightDashes = '-'.repeat(sliderLength - normalizedValue);

    return (
        <div className="slidecontainer">
            <p>{title}</p>
            <div className="slider-track">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    disabled={disabled}
                    className="slider-input"
                />
                {`<`}
                <span className="slider-dashes">{leftDashes}</span>
                <span className="slider-asterix">*</span>
                <span className="slider-dashes">{rightDashes}</span>
                {`>`}
                {/* <output>{value}</output> */}
            </div>
        </div>
    );
};
