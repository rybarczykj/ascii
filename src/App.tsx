import './App.css';
import React from 'react';

const asciiChars = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'.';
// const asciiChars = '+-`';

interface IResizeImageOptions {
    maxSize: number;
    file: File;
}
const resizeImage = (settings: IResizeImageOptions) => {
    const file = settings.file;
    const maxSize = settings.maxSize;
    const reader = new FileReader();
    const image = new Image();
    const canvas = document.createElement('canvas');

    const resize = () => {
        let width = image.width;
        let height = image.height;

        if (width > height) {
            if (width > maxSize) {
                height *= maxSize / width;
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width *= maxSize / height;
                height = maxSize;
            }
        }

        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context?.drawImage(image, 0, 0, width, height);
        return canvas;
    };

    return new Promise<HTMLCanvasElement>((ok, no) => {
        if (!file.type.match(/image.*/)) {
            no(new Error('Not an image'));
            return;
        }

        reader.onload = (readerEvent: any) => {
            image.onload = () => ok(resize());
            image.src = readerEvent.target.result;
        };
        reader.readAsDataURL(file);
    });
};

const getAscii = (canvas: HTMLCanvasElement): string => {
    const context = canvas.getContext('2d');
    const data = context?.getImageData(0, 0, canvas.width, canvas.height);

    if (!data) {
        return '';
    }

    const pixels = data.data;

    let ascii = '';
    for (let y = 0; y < data.height; y++) {
        for (let x = 0; x < data.width; x++) {
            const pixelIndex = (y * data.width + x) * 4;
            const luminance =
                (pixels[pixelIndex] + pixels[pixelIndex + 1] + pixels[pixelIndex + 2]) / 3;
            const asciiIndex = Math.floor((luminance / 255) * (asciiChars.length - 1));
            ascii += asciiChars[asciiIndex];
        }
        ascii += '\n';
    }
    return ascii;
};

function App() {
    const [selectedImage, setSelectedImage] = React.useState('');

    const [ascii, setAscii] = React.useState('');

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const myFile = event.target.files?.[0];
        if (!myFile) {
            return;
        }

        resizeImage({
            file: myFile,
            maxSize: 300,
        })
            .then((canvas) => {
                const a = getAscii(canvas);
                setAscii(a);
            })
            .catch(function (err) {
                return;
            });
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
                        fontSize: '4px',
                        fontFamily: 'courier new',
                        color: 'black',
                        whiteSpace: 'pre-line',
                        lineHeight: '1',
                        letterSpacing: '1px',
                    }}>{`${ascii}`}</h1>
            </div>
        </>
    );
}

export default App;
