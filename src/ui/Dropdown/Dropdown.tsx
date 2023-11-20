import React from 'react';
import CreatableSelect from 'react-select/creatable';

interface DropdownProps<T> {
    label: string;
    options: {
        value: T;
        label: T;
    }[];
    selectedOption: T;
    onOptionChange: (option: T) => void;
}

const Dropdown = <T,>({
    label,
    options,
    selectedOption,
    onOptionChange,
}: DropdownProps<T>): JSX.Element => {
    return (
        <div className="menu-entry">
            <div className="menu-entry-label">{label}:</div>
            <CreatableSelect
                options={options}
                className="dropdown"
                onChange={(option) => onOptionChange(option?.value || options[0].value)}
                styles={{
                    control: (baseStyles, state) => ({
                        ...baseStyles,
                        minHeight: '5px !important',
                        alignItems: 'baseline',
                        width: state.menuIsOpen ? '200px' : '100px',
                        borderRadius: '2px',
                        padding: '0px',
                    }),
                    dropdownIndicator: (baseStyles, state) => ({
                        ...baseStyles,
                        padding: '0px',
                    }),
                    input: (baseStyles, state) => ({
                        ...baseStyles,
                        padding: '0px',
                    }),
                }}
                components={{ IndicatorSeparator: () => null }}
                menuPosition="fixed"
                value={options.find((option) => option.value === selectedOption)}
            />
        </div>
    );
};

export default Dropdown;
