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

export const getAsciiFromContext = (
    context: CanvasRenderingContext2D,
    asciiChars: string | string[],
    inverse = false,
    contrast?: number,
): string => {
    const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    const greyscale = getGreyscale(imageData);
    const ascii = getAsciiFromGreyscale(greyscale, asciiChars, inverse, contrast);
    return ascii;
};

export const getGreyscale = (data: ImageData): number[][] => {
    const pixels = data.data;

    const greyscale = [];
    for (let y = 0; y < data.height; y++) {
        const greyscaleRow = [];
        for (let x = 0; x < data.width; x++) {
            const pixelIndex = (y * data.width + x) * 4;
            // perceived luminance acccording to https://en.wikipedia.org/wiki/Relative_luminance
            const luminance =
                0.2126 * pixels[pixelIndex] +
                0.7152 * pixels[pixelIndex + 1] +
                0.0722 * pixels[pixelIndex + 2];

            greyscaleRow.push(luminance);
        }
        greyscale.push(greyscaleRow);
    }
    return greyscale;
};

export const getAsciiFromGreyscale = (
    greyscale: number[][],
    asciiChars: string | string[],
    inverse = false,
    contrast?: number,
): string => {
    let ascii = '';

    // iterate over each row, and each pixel in the row
    for (let y = 0; y < greyscale.length; y++) {
        for (let x = 0; x < greyscale[y].length; x++) {
            const luminance = greyscale[y][x];

            const contrastedLuminance = contrast
                ? Math.max(Math.min((luminance - 127.5) * contrast, 255), 0)
                : luminance;

            const asciiIndex = Math.floor((contrastedLuminance / 255) * (asciiChars.length - 1));
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

const resize = (image: HTMLImageElement, maxWidth: number, canvas: HTMLCanvasElement) => {
    let width = image.width;
    let height = image.height;

    if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
    }
    // 0.6 because the ascii characters are taller than they are wide
    height *= 0.6;

    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context?.drawImage(image, 0, 0, width, height);
    return canvas;
};

interface IResizeImageOptions {
    maxWidth: number;
    file: File;
}

// Returns a Canvas with the image resized to be under MaxHeight
export const resizeImage = (settings: IResizeImageOptions): Promise<HTMLCanvasElement> => {
    const file = settings.file;
    const maxWidth = settings.maxWidth;
    const reader = new FileReader();
    const image = new Image();
    const canvas = document.createElement('canvas');

    return new Promise<HTMLCanvasElement>((ok, no) => {
        if (!file.type.match(/image.*/)) {
            no(new Error('Not an image'));
            return;
        }

        reader.onload = (readerEvent: any) => {
            image.onload = () => ok(resize(image, maxWidth, canvas));
            image.src = readerEvent.target.result;
        };
        reader.readAsDataURL(file);
    });
};
