import React from 'react';

export const ASCIICHARS = [
    'M80*|:,.` ',
    '$H2a?+.   ',
    '8+::`..',
    '+-:`  ',
    '▓▒▒░░',
    '$@WgBMQNR8%0&đD#OGKEHdbmSqpAPwU54ZX96f23kVhaeFCj1IoJyst7}{YnulzriTx?][*Lcv×<>)(/+=÷“”!;:‘,’-.',
];

interface PaletteDropdownProps {
    selectedOption: string;
    onOptionChange: (option: string) => void;
}

const PaletteDropdown: React.FC<PaletteDropdownProps> = ({ selectedOption, onOptionChange }) => {
    const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newOption = event.target.value;
        onOptionChange(newOption);
    };

    return (
        <div className="menu-entry">
            <label htmlFor="options">palette:</label>
            <select
                id="options"
                value={selectedOption}
                onChange={handleOptionChange}
                className="dropdown">
                <option value="">--Please choose an option--</option>
                {ASCIICHARS.map((char, index) => (
                    <option key={index} value={char}>
                        {char}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default PaletteDropdown;
