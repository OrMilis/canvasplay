import { Canvas, createCanvas } from 'canvas';
import { TinyColor } from '@ctrl/tinycolor';
import { Observable, of, animationFrameScheduler } from 'rxjs';
import { repeat, delay } from 'rxjs/operators';

const HEIGHT = 1280 / 1;
const WIDTH = 720 / 1;

let previousChangeTime: Record<number, number> = {};

export function createShit(
  xy: XY,
  radius: number,
  existingCanvas?: Canvas
): Canvas {
  const canvas = existingCanvas ?? createCanvas(WIDTH, HEIGHT);
  const context = canvas.getContext('2d');

  // context.fillRect(0, 0, WIDTH, HEIGHT);
  // context.fillStyle = 'white';

  // context.strokeStyle = 'white';
  // context.lineWidth = 5;

  // let index = 0;
  // for (let i = -radius; i < WIDTH + radius; i += radius * 2) {
  //   context.beginPath();
  //   // context.arc(
  //   //   i + radius + radius * index,
  //   //   (HEIGHT) / 2 - radius / 2,
  //   //   radius,
  //   //   0,
  //   //   Math.PI,
  //   //   index % 2 == 0
  //   // );

  //   const startPoint: XY = { x: i, y: HEIGHT / 2 };
  //   const midPoint: XY = {
  //     x: startPoint.x + radius,
  //     y: startPoint.y + (index % 2 === 0 ? -radius * radius : radius * radius)
  //   };
  //   const endPoint: XY = { x: midPoint.x + radius, y: startPoint.y };

  //   context.moveTo(i, HEIGHT / 2);
  //   context.arcTo(midPoint.x, midPoint.y, endPoint.x, endPoint.y, radius);
  //   context.lineTo(endPoint.x, endPoint.y);
  //   context.stroke();
  //   index++;
  // }

  return canvas;
}

export function createBackground(
  background: Background,
  existingCanvas?: Canvas
): Canvas {
  const canvas = existingCanvas ?? createCanvas(WIDTH, HEIGHT);
  const context = canvas.getContext('2d');

  context.fillStyle = background.style.color ?? 'red';
  context.fillRect(0, 0, WIDTH, HEIGHT);

  return canvas;
}

export function createCircle(
  circles: Circle[],
  existingCanvas?: Canvas
): Canvas {
  const canvas = existingCanvas ?? createCanvas(WIDTH, HEIGHT);
  const context = canvas.getContext('2d');

  circles.forEach((circle, index) => {
    context.save();

    const currentTime = Date.now();
    const change = currentTime - (previousChangeTime[index] ?? Date.now());
    const dr = circle.animation.direction === 'left' ? -1 : 1;
    context.translate(circle.animation.center.x, circle.animation.center.y);
    circle.animation.rotationAngle += (change / 1000) * dr;
    context.rotate(circle.animation.rotationAngle);
    previousChangeTime[index] = currentTime;

    context.beginPath();

    context.arc(
      circle.center.x - circle.animation.center.x,
      circle.center.y - circle.animation.center.y,
      circle.radius,
      0,
      2 * Math.PI,
      false
    );

    if (circle.style.shadowBlur !== undefined) {
      context.shadowColor = circle.style.color;
      context.shadowBlur = circle.style.shadowBlur;
    }

    if (circle.style.fill) {
      context.fillStyle = circle.style.color;
      context.fill();
    } else {
      context.lineWidth = circle.style.width ?? 1;
      context.strokeStyle = circle.style.color;
      context.stroke();
    }

    // //Rotation Animation
    // context.save();

    // context.restore();

    context.restore();
  });

  return canvas;
}

export function createTriangle(
  triangle: Triangle,
  existingCanvas?: Canvas
): Canvas {
  const canvas = existingCanvas ?? createCanvas(WIDTH, HEIGHT);
  const context = canvas.getContext('2d');

  context.lineWidth = 2;

  context.beginPath();
  context.moveTo(triangle.first.x, triangle.first.y);
  context.lineTo(triangle.second.x, triangle.second.y);
  context.lineTo(triangle.third.x, triangle.third.y);
  context.closePath();

  if (triangle.style.fill) {
    context.fillStyle = triangle.style.color;
    context.fill();
  } else {
    context.strokeStyle = triangle.style.color;
    context.stroke();
  }

  return canvas;
}

export function createHashLabel(hash: string, existingCanvas?: Canvas): Canvas {
  const canvas = existingCanvas ?? createCanvas(WIDTH, HEIGHT);
  const context = canvas.getContext('2d');

  context.save();

  context.font = 'bold 32px Poiret One';
  context.fillStyle = 'white';
  //   context.textAlign = 'center';
  context.textBaseline = 'middle';

  context.shadowColor = 'black';
  context.shadowBlur = 1;
  context.shadowOffsetX = -4;
  context.shadowOffsetY = 4;

  const upperHash = hash.toUpperCase();
  const metrics = context.measureText(upperHash);
  const actualHeight =
    (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) * 1.5;
  const textWidth = context.measureText('0').width;

  context.fillText(upperHash, textWidth, actualHeight);

  //   const chunks = [
  //     upperHash.substr(0, 8).split('').join(String.fromCharCode(8202)),
  //     upperHash.substr(8, 4).split('').join(String.fromCharCode(8202)),
  //     upperHash.substr(12, 8).split('').join(String.fromCharCode(8202)),
  //   ];

  //   const chunksXY: XY[] = [
  //     { x: textWidth * 1.5, y: actualHeight },
  //     {
  //       x:
  //         WIDTH -
  //         textWidth *
  //           1.5 *
  //           (chunks[1].split(String.fromCharCode(8202)).length - 1),
  //       y: HEIGHT - actualHeight * 2.5,
  //     },
  //     {
  //       x:
  //         WIDTH -
  //         textWidth *
  //           1.5 *
  //           (chunks[2].split(String.fromCharCode(8202)).length - 1),
  //       y: HEIGHT - actualHeight,
  //     },
  //   ];

  //   for (let i = 0; i < chunks.length; i++) {
  //     const chunkText = chunks[i];
  //     for (let j = 0; j < chunkText.length; j++) {
  //       const textWidth = context.measureText('0').width;
  //       context.fillText(
  //         chunkText[j],
  //         chunksXY[i].x + (j * textWidth) / 1.5,
  //         chunksXY[i].y
  //       );
  //     }
  //   }

  //   const chunksVertical = [
  //     upperHash.substr(24, 8).split('').join(String.fromCharCode(8202)).split(''),
  //     upperHash.substr(20, 4).split('').join(String.fromCharCode(8202)).split(''),
  //   ];

  //   const chunksVerticalXY: XY[] = [
  //     { x: WIDTH - textWidth * 1.5, y: actualHeight },
  //     {
  //       x: textWidth * 1.5,
  //       y:
  //         HEIGHT -
  //         actualHeight *
  //           (chunksVertical[1].join('').split(String.fromCharCode(8202)).length +
  //             1),
  //     },
  //   ];

  //   for (let i = 0; i < chunksVertical.length; i++) {
  //     const chunkText = chunksVertical[i];
  //     for (let j = 0; j < chunkText.length; j++) {
  //       const verticalSpacing =
  //         metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  //       context.fillText(
  //         chunkText[j],
  //         chunksVerticalXY[i].x,
  //         chunksVerticalXY[i].y + j * verticalSpacing
  //       );
  //     }
  //   }

  context.restore();

  context.strokeStyle = 'white';
  context.lineWidth = 10;
  context.font = 'bold 135px Poiret One';

  const rectPad = actualHeight / 4;
  context.strokeRect(
    rectPad,
    rectPad,
    WIDTH - 2 * rectPad,
    HEIGHT - 2 * rectPad
  );

  return canvas;
}

export function hashToBackground(hash: string): Background {
  return {
    style: {
      color: hexToColor(hash.slice(0, 6)),
      fill: true,
    },
  };
}

export function hashToCircle(hash: string): Circle[] {
  const numberOfCircles = hexToNumber(hash.charAt(hash.length - 1)) + 5;
  const circles: Circle[] = [];
  const circleColors: string[] = new TinyColor(hexToColor(hash.slice(6, 12)))
    .monochromatic(numberOfCircles)
    .map((color) => color.toHexString());

  for (let i = 0; i < numberOfCircles; i++) {
    const circle: Circle = {
      center: {
        x: numberToDimension(
          hexToNumber(
            hash.slice(
              Math.min(6 + i, hash.length - 6),
              Math.min(8 + i, hash.length - 8)
            )
          ),
          WIDTH
        ),
        y: numberToDimension(
          hexToNumber(
            hash.slice(
              Math.min(8 + i, hash.length - 8),
              Math.min(10 + i, hash.length - 10)
            )
          ),
          HEIGHT
        ),
      },
      radius: numberToDimension(
        hexToNumber(
          hash.slice(
            Math.min(10 + i, hash.length - 10),
            Math.min(12 + i, hash.length - 12)
          )
        ),
        Math.min(WIDTH / 2, HEIGHT / 2)
      ),
      style: {
        color: circleColors[i],
        fill: hexToNumber(hash.slice(6, 12)) % i === 0,
        width: mapRange(hexToNumber(hash.charAt(i)), 0, 15, 5, 12),
        shadowBlur:
          hexToNumber(hash.slice(i, hash.length - i)) % i === 0
            ? mapRange(hexToNumber(hash.charAt(i)), 0, 15, 10, 25)
            : undefined,
      },
      animation: {
        center: {
          x: 0,
          y: 0,
        },
        direction: 'left',
        rotationAngle: 0,
      },
    };

    if (circle.style.fill) {
      const alpha = mapRange(
        hexToNumber(hash.slice(6, 7)) ^
          hexToNumber(hash.slice(11, 12)) ^
          hexToNumber(hash.charAt(i)),
        0,
        15,
        0,
        1
      );
      circle.style.color = new TinyColor(circle.style.color)
        .setAlpha(alpha)
        .toHex8String();
    }

    circle.animation.center = {
      x:
        circle.center.x +
        mapRange(
          hexToNumber(
            hash.slice(
              Math.min(6 + i, hash.length - 6),
              Math.min(8 + i, hash.length - 8)
            )
          ),
          0,
          255,
          -circle.radius / 2,
          circle.radius / 2
        ),
      y:
        circle.center.y +
        mapRange(
          hexToNumber(
            hash.slice(
              Math.min(8 + i, hash.length - 8),
              Math.min(10 + i, hash.length - 10)
            )
          ),
          0,
          255,
          -circle.radius / 2,
          circle.radius / 2
        ),
    };
    circle.animation.direction =
      (hexToNumber(hash.slice(6, 12)) ^
        hexToNumber(
          hash.slice(
            Math.min(6 + i, hash.length - 6),
            Math.min(10 + i, hash.length - 10)
          )
        )) %
        i ===
      0
        ? 'left'
        : 'right';

    circles.push(circle);
  }

  return circles;
}

export function hashToTriangle(hash: string): Triangle {
  const triangleMinPos = 12;
  const triangleMaxPos = 18;
  const trianglePosHex: XY[] = [];

  for (let i = 0; i < 3; i++) {
    trianglePosHex.push({
      x: hexToNumber(
        `${hash.charAt(triangleMinPos + i)}${hash.charAt(triangleMaxPos - i)}`
      ),
      y: hexToNumber(
        `${hash.charAt(triangleMinPos - i)}${hash.charAt(triangleMaxPos + i)}`
      ),
    });
  }

  return {
    first: {
      x: numberToDimension(trianglePosHex[0].x, WIDTH),
      y: numberToDimension(trianglePosHex[0].y, HEIGHT),
    },
    second: {
      x: numberToDimension(trianglePosHex[1].x, WIDTH),
      y: numberToDimension(trianglePosHex[1].y, HEIGHT),
    },
    third: {
      x: numberToDimension(trianglePosHex[2].x, WIDTH),
      y: numberToDimension(trianglePosHex[2].y, HEIGHT),
    },
    style: {
      color: hexToColor(hash.slice(12, 18)),
      fill: false,
    },
  };
}

export function schedulerCreateCanvas(): Canvas {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const context = canvas.getContext('2d');

  context.quality = 'best';
  context.imageSmoothingQuality = 'high';

  return canvas;
}

export function clearCanvasFrame(canvas: Canvas): void {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, WIDTH, HEIGHT);
}

function hexToColor(hex: string): string {
  return `#${hex}`;
}

function numberToDimension(value: number, dimension: number): number {
  return mapRange(value, 0, hexToNumber('ff'), 0, dimension);
}

function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function hexToNumber(hex: string): number {
  return parseInt(`0x${hex}`);
}

export interface XY {
  x: number;
  y: number;
}

export interface Style {
  color: string;
  fill: boolean;
  width?: number;
  shadowBlur?: number;
}

export interface PrimitiveWithStyle {
  style: Style;
}

export interface RotateAnimation {
  center: XY;
  direction: 'left' | 'right';
  rotationAngle: number;
}

export interface Background extends PrimitiveWithStyle {}

export interface Circle extends PrimitiveWithStyle {
  center: XY;
  radius: number;
  animation: RotateAnimation;
}

export interface Triangle extends PrimitiveWithStyle {
  first: XY;
  second: XY;
  third: XY;
}
