import React from 'react';
import CreatableSelect from 'react-select/creatable';
import Creatable, { useCreatable } from 'react-select/creatable';

export const ASCIICHARS = [
    '8M0|*|::`,.',
    'M80*|:,.` ',
    '$H2a?+.   ',
    '8+::`..',
    '+-:`  ',
    '▓▒▒░░ ',
    '$@WgBMQNR8%0&đD#OGKEHdbmSqpAPwU54ZX96f23kVhaeFCj1IoJyst7}{YnulzriTx?][*Lcv×<>)(/+=÷“”!;:‘,’-.',
    ['8 ', 'M ', '0 ', '# ', '$ ', '| ', '* ', '+ ', ': ', ': ', '` ', '. ', '. '],
];

const asciiOptions = ASCIICHARS.map((char) => ({ value: char, label: char }));

interface PaletteDropdownProps {
    selectedOption: string | string[];
    onOptionChange: (option: string | string[]) => void;
}

const PaletteDropdown: React.FC<PaletteDropdownProps> = ({ selectedOption, onOptionChange }) => {
    const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newOption = event.target.value;
        onOptionChange(newOption);
    };

    return (
        <div className="menu-entry">
            <label htmlFor="options">palette:</label>
            <CreatableSelect
                options={asciiOptions}
                className="dropdown"
                onChange={(option) => onOptionChange(option?.value || ASCIICHARS[0])}
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
                value={asciiOptions.find((option) => option.value === selectedOption)}
            />
        </div>
    );
};

export default PaletteDropdown;
