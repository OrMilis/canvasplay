import { Canvas, createCanvas } from 'canvas';
import { TinyColor } from '@ctrl/tinycolor';
import { Observable, of, animationFrameScheduler } from 'rxjs';
import { repeat, delay } from 'rxjs/operators';

const HEIGHT = 1400 / 1;
const WIDTH = 1200 / 1;

const CIRCLES_WIDTH = 1160;
const CIRCLES_HEIGHT = CIRCLES_WIDTH;

const PADDING = WIDTH - CIRCLES_WIDTH;

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
  canvas: Canvas
): Canvas {
  const context = canvas.getContext('2d');

  context.fillStyle = background.style.color ?? 'red';
  context.fillRect(PADDING, PADDING, CIRCLES_WIDTH, CIRCLES_HEIGHT);

  return canvas;
}

export function createCircle(circles: Circle[], canvas: Canvas): Canvas {
  const context = canvas.getContext('2d');

  const bufferCanvas = createCanvas(CIRCLES_WIDTH, CIRCLES_HEIGHT);
  const bufferContext = bufferCanvas.getContext('2d');

  circles.forEach((circle, index) => {
    bufferContext.save();

    const currentTime = Date.now();
    const change = currentTime - (previousChangeTime[index] ?? Date.now());
    const dr = circle.animation.direction === 'left' ? -1 : 1;
    bufferContext.translate(
      circle.animation.center.x,
      circle.animation.center.y
    );
    circle.animation.rotationAngle += (change / 1000) * dr;
    bufferContext.rotate(circle.animation.rotationAngle);
    previousChangeTime[index] = currentTime;

    bufferContext.beginPath();

    bufferContext.arc(
      circle.center.x - circle.animation.center.x,
      circle.center.y - circle.animation.center.y,
      circle.radius,
      0,
      2 * Math.PI,
      false
    );

    if (circle.style.shadowBlur !== undefined) {
      bufferContext.shadowColor = circle.style.color;
      bufferContext.shadowBlur = circle.style.shadowBlur;
    }

    if (circle.style.fill) {
      bufferContext.fillStyle = circle.style.color;
      bufferContext.fill();
    } else {
      bufferContext.lineWidth = circle.style.width ?? 1;
      bufferContext.strokeStyle = circle.style.color;
      bufferContext.stroke();
    }

    bufferContext.restore();
  });

  context.drawImage(bufferCanvas, PADDING, PADDING);

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

export function createFrame(canvas: Canvas): Canvas {
  const context = canvas.getContext('2d');

  const bufferCanvas = createCanvas(WIDTH, HEIGHT);
  const bufferContext = bufferCanvas.getContext('2d');

  bufferContext.save();

  bufferContext.globalCompositeOperation = 'xor';
  bufferContext.fillStyle = 'white';

  bufferContext.fillRect(0, 0, WIDTH, HEIGHT);
  bufferContext.fillRect(
    PADDING,
    PADDING,
    CIRCLES_WIDTH - PADDING,
    CIRCLES_HEIGHT - PADDING
  );

  bufferContext.restore();

  context.save();
  context.shadowColor = '#00000077';
  context.shadowBlur = PADDING;

  context.drawImage(bufferCanvas, 0, 0);
  context.restore();

  return canvas;
}

export function createHashLabel(hash: string, canvas: Canvas): Canvas {
  //65px per hash char. 2 rows
  const context = canvas.getContext('2d');
  const primaryColor = hashToBackground(hash).style.color;

  context.save();

  context.font = '149px Poiret One';
  context.fillStyle = primaryColor;
  // context.textAlign = 'center';
  context.textBaseline = 'middle';

  const hexPrefix = '0X';
  const hexPrefixMeasure = context.measureText(hexPrefix);
  const hexPrefixHeight =
    hexPrefixMeasure.actualBoundingBoxAscent +
    hexPrefixMeasure.actualBoundingBoxDescent / 2;
  const charCanvasWidth =
    (CIRCLES_WIDTH - PADDING * 2 - hexPrefixMeasure.width) / (hash.length / 2);
  const charCanvasHeight = charCanvasWidth;

  context.fillText(
    hexPrefix,
    PADDING,
    CIRCLES_HEIGHT + PADDING + hexPrefixHeight
  );

  // context.fillStyle = 'red';
  // context.fillRect(PADDING, CIRCLES_HEIGHT, CIRCLES_WIDTH - PADDING, PADDING);
  // context.fillRect(PADDING, HEIGHT - PADDING, CIRCLES_WIDTH - PADDING, PADDING);
  context.restore();

  context.save();

  const splittedHash: string[] = [
    hash.toUpperCase().slice(0, hash.length / 2),
    hash.toUpperCase().slice(hash.length / 2, hash.length),
  ];

  splittedHash.forEach((hashLine, lineIndex) => {
    const characters = hashLine.split('');
    const lineCanvas = createCanvas(
      charCanvasHeight * (hash.length / 2),
      charCanvasHeight
    );
    const lineContext = lineCanvas.getContext('2d');

    characters.forEach((char, charIndex) => {
      const charCanvas = createCanvas(charCanvasWidth, charCanvasHeight);

      const charCombinationNumber =
        hexToNumber(char) ^
        hexToNumber(hash.charAt(hash.length - 1 - charIndex));
      if (charCombinationNumber % 2 === 0) {
        drawLabelChar(charCanvas, char, primaryColor, 'white');
      } else {
        drawLabelChar(charCanvas, char, 'white', primaryColor);
      }

      lineContext.drawImage(charCanvas, charCanvasWidth * charIndex, 0);
    });

    context.drawImage(
      lineCanvas,
      hexPrefixMeasure.width + PADDING * 2,
      CIRCLES_HEIGHT +
        PADDING +
        charCanvasHeight / 2 +
        charCanvasHeight * lineIndex
    );
  });

  context.restore();

  return canvas;
}

function drawLabelChar(
  charCanvas: Canvas,
  char: string,
  charColor: string,
  backgroundColor: string
): void {
  const charContext = charCanvas.getContext('2d');
  const charMeasure = charContext.measureText(char);
  const charHeight =
    charMeasure.actualBoundingBoxAscent +
    charMeasure.actualBoundingBoxDescent / 2;

  charContext.font = '40px Poiret One';
  charContext.textAlign = 'center';
  charContext.textBaseline = 'middle';

  charContext.fillStyle = backgroundColor;
  charContext.fillRect(0, 0, charCanvas.width, charCanvas.height);

  charContext.save();
  charContext.beginPath();
  charContext.strokeStyle = 'white';
  charContext.lineWidth = 5;
  charContext.moveTo(0, charCanvas.height);
  charContext.lineTo(charCanvas.width, charCanvas.height);
  charContext.stroke();
  charContext.restore();

  charContext.fillStyle = charColor;
  charContext.fillText(
    char,
    charCanvas.width / 2,
    (charCanvas.height + charHeight / 2) / 2
  );
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
