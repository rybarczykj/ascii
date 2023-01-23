import './index.css';
import React from 'react';
import debounce from 'lodash.debounce';

// const asciiChars = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'.';
// const asciiChars = '+-:`  ';
const asciiChars = '#8?0/;.`';

const artWidth = 2000;

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
    const [ascii, setAscii] = React.useState('');
    const [currentFile, setCurrentFile] = React.useState<File>();

    const [specs, setSpecs] = React.useState({ fontSize: 40, resolution: 50, letterSpacing: 1 });
    const readFileAndSetAscii = (file: File, maxSize: number) => {
        resizeImage({
            file: file,
            maxSize: maxSize,
        }).then((canvas) => {
            const a = getAscii(canvas);
            setAscii(a);
        });
    };

    const debouncedOnChangeRef = React.useRef<(file: File, resolution: number) => void>(
        (file: File, resolution: number) => {
            readFileAndSetAscii(file, resolution);
        },
    );

    const debounceOnChange = React.useCallback(
        debounce(
            (file: File, resolution: number) => debouncedOnChangeRef.current(file, resolution),
            1000,
        ),
        [],
    );

    return (
        <div className="flex-container">
            <div className="menu">
                <div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            const myFile = event.target.files?.[0];
                            if (!myFile) {
                                return;
                            }
                            setCurrentFile(myFile);
                            readFileAndSetAscii(myFile, specs.resolution);
                        }}
                    />
                </div>
                <div className="slidecontainer">
                    <p>font size:</p>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        className="slider"
                        id="fontSize"
                        onChange={(event) => {
                            const fontSize = parseFloat(event.target.value);

                            setSpecs({ ...specs, fontSize: fontSize });
                        }}
                    />
                    <output>{specs.fontSize.toString().slice(0, 5)}</output>
                </div>

                <div className="slidecontainer">
                    <p>spacing between letters:</p>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        className="slider"
                        id="letterSpacing"
                        onChange={(event) => {
                            setSpecs({ ...specs, letterSpacing: parseFloat(event.target.value) });
                        }}
                    />
                    <output>{specs.letterSpacing.toString().slice(0, 5)}</output>
                </div>

                <div className="slidecontainer">
                    <p>resolution:</p>
                    <input
                        type="range"
                        min="50"
                        max="500"
                        className="slider"
                        id="resolution"
                        onChange={(event) => {
                            const r = parseFloat(event.target.value);
                            const f = Math.floor(artWidth / r);
                            const s = artWidth / (r * f);

                            setSpecs({ resolution: r, fontSize: f, letterSpacing: s });

                            if (currentFile) {
                                debounceOnChange(currentFile, r);
                            }
                        }}
                    />
                    <output>{specs.resolution.toString().slice(0, 5)}</output>
                </div>
            </div>

            <pre>
                <h1
                    style={{
                        fontSize: `${specs.fontSize}px`,
                        fontFamily: 'courier',
                        color: 'black',
                        lineHeight: '0.5',
                        letterSpacing: specs.letterSpacing,
                    }}>{`${ascii}`}</h1>
            </pre>
        </div>
    );
}

export default App;
