import React from 'react';
import Sketch from 'react-p5';
import { ProcessedPixelData } from '../dots-utils';
import { DotShape } from './DotsMenu';

// Using 'any' for p5 types due to react-p5 using older @types/p5 version
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type P5Instance = any;

interface DotsCanvasProps {
    pixelData: ProcessedPixelData | null;
    zoom: number;
    resolution: number;
    minDotSize: number;
    maxDotSize: number;
    shape: DotShape;
    forceOGColors: boolean;
    removeWhite: boolean;
    whitePoint: number;
    showOriginalBackground: boolean;
    sourceFile: File | null;
    videoElement: HTMLVideoElement | null;
    className?: string;
}

// Helper to draw different shapes
const drawShape = (p5: P5Instance, shape: DotShape, x: number, y: number, size: number) => {
    const half = size / 2;
    
    // Extract shape name from format like "● circle"
    const shapeName = shape.split(' ')[1];
    
    switch (shapeName) {
        case 'circle':
            p5.circle(x, y, size);
            break;
        case 'square':
            p5.rectMode(p5.CENTER);
            p5.rect(x, y, size, size);
            break;
        case 'diamond':
            p5.push();
            p5.translate(x, y);
            p5.rotate(p5.PI / 4);
            p5.rectMode(p5.CENTER);
            p5.rect(0, 0, size * 0.7, size * 0.7);
            p5.pop();
            break;
        case 'triangle':
            p5.triangle(
                x, y - half,
                x - half, y + half * 0.6,
                x + half, y + half * 0.6
            );
            break;
        case 'cross':
            const thickness = size * 0.3;
            p5.rectMode(p5.CENTER);
            p5.rect(x, y, size, thickness);
            p5.rect(x, y, thickness, size);
            break;
        case 'ring':
            p5.noFill();
            p5.strokeWeight(size * 0.15);
            p5.circle(x, y, size * 0.85);
            break;
    }
};

export const DotsCanvas: React.FC<DotsCanvasProps> = ({
    pixelData,
    zoom,
    resolution,
    minDotSize,
    maxDotSize,
    shape,
    forceOGColors,
    removeWhite,
    whitePoint,
    showOriginalBackground,
    sourceFile,
    videoElement,
    className,
}) => {
    const p5Ref = React.useRef<P5Instance | null>(null);
    const backgroundImageRef = React.useRef<HTMLImageElement | null>(null);
    const lastSourceUrlRef = React.useRef<string | null>(null);

    // Calculate dot spacing to keep visual size constant regardless of resolution
    const dotSpacing = (1000 / resolution) * zoom;

    // Refs so draw() always sees latest props (react-p5 can invoke a stale draw on redraw())
    const drawParamsRef = React.useRef({
        pixelData,
        forceOGColors,
        removeWhite,
        whitePoint,
        shape,
        minDotSize,
        maxDotSize,
        dotSpacing,
        showOriginalBackground,
        videoElement,
    });
    drawParamsRef.current = {
        pixelData,
        forceOGColors,
        removeWhite,
        whitePoint,
        shape,
        minDotSize,
        maxDotSize,
        dotSpacing,
        showOriginalBackground,
        videoElement,
    };

    // Load background image when sourceFile changes
    React.useEffect(() => {
        if (sourceFile && showOriginalBackground) {
            const url = URL.createObjectURL(sourceFile);
            const img = new Image();
            img.onload = () => {
                backgroundImageRef.current = img;
                if (p5Ref.current) {
                    p5Ref.current.redraw();
                }
            };
            img.src = url;
            
            // Cleanup previous URL
            if (lastSourceUrlRef.current) {
                URL.revokeObjectURL(lastSourceUrlRef.current);
            }
            lastSourceUrlRef.current = url;
            
            return () => {
                URL.revokeObjectURL(url);
            };
        } else {
            backgroundImageRef.current = null;
        }
    }, [sourceFile, showOriginalBackground]);

    // Force redraw when any visual setting changes
    React.useEffect(() => {
        if (p5Ref.current && pixelData) {
            p5Ref.current.redraw();
        }
    }, [pixelData, zoom, resolution, dotSpacing, minDotSize, maxDotSize, shape, forceOGColors, removeWhite, whitePoint, showOriginalBackground]);

    const setup = (p5: P5Instance, canvasParentRef: Element) => {
        p5Ref.current = p5;
        const params = drawParamsRef.current;
        if (!params.pixelData) {
            p5.createCanvas(300, 200).parent(canvasParentRef);
            p5.noLoop();
            return;
        }

        const canvasWidth = params.pixelData.width * params.dotSpacing;
        const canvasHeight = params.pixelData.height * params.dotSpacing;
        p5.createCanvas(canvasWidth, canvasHeight).parent(canvasParentRef);
        p5.noLoop();
        p5.noStroke();
    };

    const draw = (p5: P5Instance) => {
        const params = drawParamsRef.current;
        p5.background(255);
        p5.noStroke();

        if (!params.pixelData) {
            return;
        }

        const maxPossibleSize = params.dotSpacing * 0.95;
        const expectedWidth = params.pixelData.width * params.dotSpacing;
        const expectedHeight = params.pixelData.height * params.dotSpacing;
        if (p5.width !== expectedWidth || p5.height !== expectedHeight) {
            p5.resizeCanvas(expectedWidth, expectedHeight);
        }

        if (params.showOriginalBackground) {
            const ctx = p5.drawingContext as CanvasRenderingContext2D;
            if (params.videoElement && params.videoElement.readyState >= 2) {
                ctx.drawImage(params.videoElement, 0, 0, expectedWidth, expectedHeight);
            } else if (backgroundImageRef.current) {
                ctx.drawImage(backgroundImageRef.current, 0, 0, expectedWidth, expectedHeight);
            }
        }

        for (let y = 0; y < params.pixelData.height; y++) {
            for (let x = 0; x < params.pixelData.width; x++) {
                const pixel = params.pixelData.pixels[y][x];
                const colorPixel = params.forceOGColors ? params.pixelData.originalPixels[y][x] : pixel;

                const brightness = (pixel.r + pixel.g + pixel.b) / (3 * 255);
                const sizeMultiplier = params.minDotSize + (params.maxDotSize - params.minDotSize) * brightness;
                const dotSize = maxPossibleSize * sizeMultiplier;

                if (dotSize < 0.5) {
                    continue;
                }

                if (params.removeWhite) {
                    const avgColor = (colorPixel.r + colorPixel.g + colorPixel.b) / 3;
                    if (avgColor >= params.whitePoint) {
                        continue;
                    }
                }

                if (params.shape.includes('ring')) {
                    p5.stroke(colorPixel.r, colorPixel.g, colorPixel.b);
                    p5.noFill();
                } else {
                    p5.noStroke();
                    p5.fill(colorPixel.r, colorPixel.g, colorPixel.b);
                }

                drawShape(
                    p5,
                    params.shape,
                    x * params.dotSpacing + params.dotSpacing / 2,
                    y * params.dotSpacing + params.dotSpacing / 2,
                    dotSize
                );
            }
        }
    };

    return (
        <div className={className}>
            <Sketch setup={setup} draw={draw} />
        </div>
    );
};

