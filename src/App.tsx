import './App.css';
import React from 'react';

function App() {
    const [selectedImage, setSelectedImage] = React.useState('');

    const [ascii, setAscii] = React.useState('');

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return <div>{'hee'}</div>;
        }
        const reader = new FileReader();
        console.log('LOADING...');

        reader.onload = () => {
            const src = reader.result as string;
            setSelectedImage(src);

            console.log('loaded mf');
            const canvas = document.createElement('canvas');

            const context = canvas.getContext('2d');

            if (!context) {
                return <>{'okayyyyy'}</>;
            }

            const image = new Image();
            image.src = src;

            image.onload = () => {
                console.log('image loaded mf');
                canvas.width = image.width;
                canvas.height = image.height;

                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(image, 0, 0);

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;
                const asciiChars = '@B%8WM#-...,';
                let asciiArt = '';

                for (let y = 0; y < image.height; y++) {
                    for (let x = 0; x < image.width; x++) {
                        const pixelIndex = (y * image.width + x) * 4;
                        const luminance =
                            (pixels[pixelIndex] + pixels[pixelIndex + 1] + pixels[pixelIndex + 2]) /
                            3;
                        const asciiIndex = Math.floor((luminance / 255) * (asciiChars.length - 1));
                        asciiArt += asciiChars[asciiIndex];
                    }
                    asciiArt += '\n';
                }

                setAscii(asciiArt);
            };
        };
        reader.readAsDataURL(file);
    };

    return (
        <>
            <div>
                <input type="file" accept="image/*" onChange={onChange} />
            </div>
            <div>
                {selectedImage !== '' && (
                    <div>
                        <h3>{`current image src: ${selectedImage}`}</h3>
                        <br />
                    </div>
                )}
                <br />
                <h1
                    style={{
                        fontSize: '.5px',
                        fontFamily: 'Courier new',
                        color: 'blue',
                        whiteSpace: 'pre-line',
                    }}>{`current ascii art: ${ascii}`}</h1>
            </div>
        </>
    );
}

export default App;
