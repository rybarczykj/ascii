import React from 'react';

export const ASCIICHARS = [
    '8M0|*|::`,.',
    '+::`..',
    '+-:`  ',
    '▓▒▒░░',
    '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\\\'.',
    '$@WgBMQNR8%0&đD#OGKEHdbmSqpAPwU54ZX96f23kVhaeFCj1IoJyst7}{YnulzriTx?][*Lcv×<>)(/+=÷“”!;:‘,’-.',
];

interface DropdownMenuProps {
    selectedOption: string;
    onOptionChange: (option: string) => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ selectedOption, onOptionChange }) => {
    const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newOption = event.target.value;
        onOptionChange(newOption);
    };

    return (
        <div>
            <label htmlFor="options">Select an option:</label>
            <select id="options" value={selectedOption} onChange={handleOptionChange}>
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

export default DropdownMenu;
