import React from 'react';
import CreatableSelect from 'react-select/creatable';

interface DropdownProps {
    label: string;
    options: {
        value: string | string[];
        label: string | string[];
    }[];
    selectedOption: string | string[];
    onOptionChange: (option: string | string[]) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, selectedOption, onOptionChange }) => {
    return (
        <div className="menu-entry">
            <label htmlFor="options">{label}:</label>
            <CreatableSelect
                options={options}
                className="dropdown"
                onChange={(option) => onOptionChange(option?.value || options[0].value)}
                styles={{
                    control: (baseStyles, state) => ({
                        ...baseStyles,
                        minHeight: '10px !important',
                        // maxHeight: '10px !important',
                        height: '30px',
                        alignItems: 'baseline',
                        width: state.menuIsOpen ? '200px' : '100px',
                        margin: '0px auto',
                        marginTop: '10px',
                    }),
                    dropdownIndicator: (baseStyles, state) => ({
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
