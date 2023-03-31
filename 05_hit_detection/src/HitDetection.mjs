import { BOTTOM, NORTH, TOP, WEST, X, Y, Z } from "./utils.mjs";
import { WorldRenderer } from "./WorldRenderer.mjs";

const sides = [
  // TOP
  {
    direction: [0,0,1],
    coords: [
      [0,0,1],
      [1,0,1],
      [1,1,1],
      [0,1,1],
    ]
  },
  // BOTTOM
  {
    direction: [0,0,-1],
    coords: [
      [0,0,0],
      [1,0,0],
      [1,1,0],
      [0,1,0],
    ]
  },
  // NORTH
  {
    direction: [0,1,0],
    coords: [
      [0,1,0],
      [1,1,0],
      [1,1,1],
      [0,1,1],
    ]
  },
  // EAST
  {
    direction: [1,0,0],
    coords: [
      [1,0,0],
      [1,1,0],
      [1,1,1],
      [1,0,1],
    ]
  },
  // SOUTH
  {
    direction: [0,-1,0],
    coords: [
      [0,0,0],
      [1,0,0],
      [1,0,1],
      [0,0,1],
    ]
  },
  // WEST
  {
    direction: [-1,0,0],
    coords: [
      [0,0,0],
      [0,1,0],
      [0,1,1],
      [0,0,1],
    ]
  },
]

export class HitDetection {
  /** 
   * @param {WorldRenderer} worldRenderer 
   */
  constructor(worldRenderer) {
    this.worldRenderer = worldRenderer;
  }

  /**
   * @param {[number, number]} mouseCoord 
   */
  detect(mouseCoord, blockCoord) {
    this.worldRenderer.ctx.save();
    this.worldRenderer.ctx.translate(...this.worldRenderer.coords.worldToScreen(...blockCoord));

    const blockScreenCoord = this.worldRenderer.coords.worldToScreen(...blockCoord);
    const relativeMouseCoord = [
      mouseCoord[X] - blockScreenCoord[X],
      mouseCoord[Y] - blockScreenCoord[Y],
    ];

    for (let index = TOP; index <= BOTTOM; index ++) {
      if (
        this.sideDirectionIsVisible(sides[index].direction) &&
        this.verticalSideCheck(sides[index].coords, relativeMouseCoord)
      ) {
        this.worldRenderer.ctx.restore();
        return index;
      }
    }

    for (let index = NORTH; index <= WEST; index ++) {
      if (
        this.sideDirectionIsVisible(sides[index].direction) &&
        this.sideCheck(sides[index].coords, relativeMouseCoord)
      ) {
        this.worldRenderer.ctx.restore();
        return index;
      }
    }

    this.worldRenderer.ctx.restore();
  }

  sideDirectionIsVisible(direction) {
    const screenCoord = this.worldRenderer.coords.worldToScreen(...direction);
    return screenCoord[Z] < 0;
  }

  verticalSideCheck(sideCoords, targetCoord) {
    const { coords } = this.worldRenderer;
    const screenCoords = sideCoords.map(sideCoord =>coords.worldToScreen(...sideCoord));

    let topMost = 0;
    let rightMost = 0;
    let bottomMost = 0;
    let leftMost = 0;

    let top = screenCoords[0][Y];
    let right = screenCoords[0][X];
    let bottom = screenCoords[0][Y];
    let left = screenCoords[0][X];

    for (let index = 1; index < 4; index ++) {
      const screenCoord = screenCoords[index];
      
      if (screenCoord[Y] >= top) {
        top = screenCoord[Y];
        topMost = index;
      }

      if (screenCoord[X] >= right) {
        right = screenCoord[X];
        rightMost = index;
      }

      if (screenCoord[Y] <= bottom) {
        bottom = screenCoord[Y];
        bottomMost = index;
      }

      if (screenCoord[X] <= left) {
        left = screenCoord[X];
        leftMost = index;
      }
    }

    const slopeLeftTop = slope(screenCoords[leftMost], screenCoords[topMost]);
    const slopeLeftBottom = slope(screenCoords[leftMost], screenCoords[bottomMost]);
    const slopeRightTop = slope(screenCoords[rightMost], screenCoords[topMost]);
    const slopeRightBottom = slope(screenCoords[rightMost], screenCoords[bottomMost]);

    // TODO: All values above could be precalculated

    if (
      targetCoord[X] > left &&
      targetCoord[X] < right &&
      targetCoord[Y] > bottom &&
      targetCoord[Y] < top
    ) {
      this.drawBoundingBox(top, right, bottom, left);
    } else {
      return false;
    }

    // Are we aligned with the axis? Then being in the bounding box means we have a HIT
    if (
      // TODO can also be precalculated as `side.alignedWithAxis`?
      screenCoords[leftMost][Y] === top ||
      screenCoords[leftMost][Y] === bottom || 
      screenCoords[rightMost][Y] === top ||
      screenCoords[rightMost][Y] === bottom
    ) {
      this.drawHitMarker(screenCoords);
      return true;
    }

    // Target slopes
    const slopeLeftToTarget = slope(screenCoords[leftMost], targetCoord);
    const slopeRightToTarget = slope(screenCoords[rightMost], targetCoord);

    // Draw side slopes
    this.drawSlope(screenCoords[leftMost], slopeLeftTop, '#0b0');
    this.drawSlope(screenCoords[leftMost], slopeLeftBottom, '#33b');
    this.drawSlope(screenCoords[rightMost], slopeRightTop, '#0b0');
    this.drawSlope(screenCoords[rightMost], slopeRightBottom, '#33f');

    // Draw target slopes
    this.drawSlope(screenCoords[leftMost], slopeLeftToTarget, '#b00');
    this.drawSlope(screenCoords[rightMost], slopeRightToTarget, '#b00');

    // Highlight corners
    this.drawRect(screenCoords[topMost], 6, '#0b0');
    this.drawRect(screenCoords[rightMost], 6, '#b0b');
    this.drawRect(screenCoords[bottomMost], 6, '#00b');
    this.drawRect(screenCoords[leftMost], 6, '#bb0');

    if (
      slopeLeftTop > slopeLeftToTarget  &&
      slopeLeftToTarget > slopeLeftBottom &&
      slopeRightBottom > slopeRightToTarget &&
      slopeRightToTarget > slopeRightTop
    ) {
      this.drawHitMarker(screenCoords);
      return true;
    }

    return false;
  }

  sideCheck(sideCoords, targetCoord) {
    const { coords } = this.worldRenderer;
    const screenCoords = sideCoords.map(sideCoord => coords.worldToScreen(...sideCoord));

    let topLeft = 0;
    let topRight = 0;
    let bottomRight = 0;
    let bottomLeft = 0;

    let top = screenCoords[0][Y];
    let right = screenCoords[0][X];
    let bottom = screenCoords[0][Y];
    let left = screenCoords[0][X];

    for (let index = 1; index < 4; index ++) {
      const screenCoord = screenCoords[index];

      if (screenCoord[X] <= left) {
        left = screenCoord[X];

        // Either replace topLeft because it was not the left most or not top most
        if (screenCoord[X] < screenCoords[topLeft][X] || screenCoord[Y] > screenCoords[topLeft][Y]) {
          topLeft = index;
        }

        // Either replace bottomLeft because it was not the left most or not bottom most
        if (screenCoord[X] < screenCoords[bottomLeft][X] || screenCoord[Y] < screenCoords[bottomLeft][Y]) {
          bottomLeft = index;
        }
      }
      
      if (screenCoord[X] >= right) {
        right = screenCoord[X];

        // Either replace topRight because it was not the right most or not top most
        if (screenCoord[X] > screenCoords[topRight][X] || screenCoord[Y] > screenCoords[topRight][Y]) {
          topRight = index;
        }

        // Either replace bottomRight because it was not the right most or not bottom most
        if (screenCoord[X] > screenCoords[bottomRight][X] || screenCoord[Y] < screenCoords[bottomRight][Y]) {
          bottomRight = index;
        }
      }

      if (screenCoord[Y] > top) {
        top = screenCoord[Y];
      }

      if (screenCoord[Y] < bottom) {
        bottom = screenCoord[Y];
      }
    }

    const topSlope = slope(screenCoords[topLeft], screenCoords[topRight]);
    const bottomSlope = slope(screenCoords[bottomLeft], screenCoords[bottomRight]);

    // TODO: All values above could be precalculated

    if (
      targetCoord[X] > left &&
      targetCoord[X] < right &&
      targetCoord[Y] > bottom &&
      targetCoord[Y] < top
    ) {
      this.drawBoundingBox(top, right, bottom, left);
    } else {
      return false;
    }

    // Draw side slopes
    this.drawSlope(screenCoords[topLeft], topSlope, '#0b0');
    this.drawSlope(screenCoords[bottomLeft], bottomSlope, '#33b');

    // Target slopes
    const slopeTopToTarget = slope(screenCoords[topLeft], targetCoord);
    const slopeBottomToTarget = slope(screenCoords[bottomLeft], targetCoord);

    // Draw target slopes
    this.drawSlope(screenCoords[topLeft], slopeTopToTarget, '#b00');
    this.drawSlope(screenCoords[bottomLeft], slopeBottomToTarget, '#b00');

    // Highlight detected corners
    this.drawRect(screenCoords[topRight], 6, '#0b0');
    this.drawRect(screenCoords[topLeft], 6, '#b0b');
    this.drawRect(screenCoords[bottomRight], 6, '#00b');
    this.drawRect(screenCoords[bottomLeft], 6, '#bb0');

    if (
      slopeTopToTarget < topSlope  &&
      slopeBottomToTarget > bottomSlope
    ) {
      this.drawHitMarker(screenCoords);
      return true;
    }

    return false;
  }

  drawRect(screenCoord, size, fillStyle) {
    const { ctx } = this.worldRenderer;

    ctx.save();
    if (fillStyle) {
      ctx.fillStyle = fillStyle;
    }

    ctx.fillRect(
      screenCoord[X] - size / 2,
      screenCoord[Y] - size / 2,
      size,
      size,
    );

    if (fillStyle) {
      ctx.restore();
    }
  }

  drawSlope(screenCoord, slope, fillStyle) {
    const { ctx } = this.worldRenderer;
    const xTravel = slope === Infinity ? 0 : 100;
    const yTravel = slope === Infinity ? 100 : xTravel * slope;

    ctx.beginPath();

    ctx.moveTo(screenCoord[X] - xTravel, screenCoord[Y] - yTravel);
    ctx.lineTo(screenCoord[X] + xTravel, screenCoord[Y] + yTravel);

    ctx.save();
    ctx.strokeStyle = fillStyle;
    ctx.stroke();
    ctx.restore();
  }

  drawBoundingBox(top, right, bottom, left) {
    const { ctx } = this.worldRenderer;

    ctx.beginPath()
    ctx.moveTo(left, bottom)
    ctx.lineTo(left, top)
    ctx.lineTo(right, top)
    ctx.lineTo(right, bottom)
    ctx.closePath();

    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.restore();
  }

  drawHitMarker(screenCoords) {
    const { ctx } = this.worldRenderer;

    ctx.beginPath()
    ctx.moveTo(...screenCoords[0])
    ctx.lineTo(...screenCoords[1])
    ctx.lineTo(...screenCoords[2])
    ctx.lineTo(...screenCoords[3])
    ctx.closePath();

    ctx.save();
    ctx.fillStyle = '#fff5';
    ctx.fill();
    ctx.restore();
  }
}

function slope(a, b) {
  return (b[Y] - a[Y]) / (b[X] - a[X])
}
