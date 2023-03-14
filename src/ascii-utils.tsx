// const asciiChars = '+::`..';
// const asciiChars =
//     '$@WgBMQNR8%0&đD#OGKEHdbmSqpAPwU54ZX96f23kVhaeFCj1IoJyst7}{YnulzriTx?][*Lcv×<>)(/+=÷“”!;:‘,’-.';

// const asciiChars = '▓▒▒░░';
// const asciiChars = ['8 ', 'M ', '0 ', '# ', '$ ', '| ', '* ', '+ ', ': ', ': ', '` ', '. ', '. '];

// const asciiChars = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'.';
// const asciiChars = '+-:`  ';
['8 ', 'M ', '0 ', '# ', '$ ', '| ', '* ', '+ ', ': ', ': ', '` ', '. ', '. '];

// export const ASCIICHARS = [
//     '8M0|*|::`,.',
//     '+::`..',
//     '+-:`  ',
//     '▓▒▒░░',
//     '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'.',
//     '$@WgBMQNR8%0&đD#OGKEHdbmSqpAPwU54ZX96f23kVhaeFCj1IoJyst7}{YnulzriTx?][*Lcv×<>)(/+=÷“”!;:‘,’-.',
// ];

// const asciiChars = '8M0#$|*|::`,.';
// const asciiChars = '#8?0+:.,';
// const asciiChars = '8#|:.';

export const getAsciiFromCanvas = (
    canvas: HTMLCanvasElement,
    asciiChars: string,
    inverse = false,
): string => {
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
            if (inverse) {
                ascii += asciiChars[asciiChars.length - asciiIndex - 1];
            } else {
                ascii += asciiChars[asciiIndex];
            }
        }
        ascii += '\n';
    }
    return ascii;
};

interface IResizeImageOptions {
    maxWidth: number;
    file: File;
}
export const resizeImage = (settings: IResizeImageOptions): Promise<HTMLCanvasElement> => {
    const file = settings.file;
    const maxWidth = settings.maxWidth;
    const reader = new FileReader();
    const image = new Image();
    const canvas = document.createElement('canvas');

    const resize = () => {
        let width = image.width;
        let height = image.height;

        if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
        }
        height *= 0.6;

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
