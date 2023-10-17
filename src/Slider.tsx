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
    const [isDragging, setIsDragging] = React.useState(false);

    const sliderLength = 10;
    const normalizedValue = Math.floor(((value - min) / (max - min)) * sliderLength);

    const leftDashes = '-'.repeat(normalizedValue);
    const rightDashes = '-'.repeat(sliderLength - normalizedValue);

    const startXpos = 0;
    const endXpos = 100;

    return (
        <div className="slidecontainer">
            <p>{title}</p>

            <div className="slider-track">
                {leftDashes}
                <span
                    className="slider-thumb"
                    style={{
                        left: `calc(${(normalizedValue / sliderLength) * 100}% - 10px)`,
                    }}
                    draggable
                    onDrag={(e) => {
                        if (isDragging) {
                            // map the x position of the mouse to a value between min and max
                            const xpos = Math.min((e as unknown as MouseEvent).clientX, endXpos);

                            const newValue =
                                (startXpos + xpos / (startXpos + endXpos)) * (max - min) + min;
                            onChange(newValue);
                        }
                    }}
                    onDragStart={() => {
                        setIsDragging(true);
                    }}
                    onDragEnd={() => {
                        setIsDragging(false);
                    }}>
                    *
                </span>

                {rightDashes}
            </div>
            <output>{label}</output>
        </div>
    );
};
