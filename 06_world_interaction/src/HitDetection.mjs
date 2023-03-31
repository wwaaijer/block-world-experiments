import { sides } from "./sides.mjs";
import { BOTTOM, EAST, NORTH, SOUTH, TOP, WEST, X, Y, Z } from "./utils.mjs";
import { WorldRenderer } from "./WorldRenderer.mjs";

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
    const blockScreenCoord = this.worldRenderer.coords.worldToScreen(...blockCoord);
    const relativeMouseCoord = [
      mouseCoord[X] - blockScreenCoord[X],
      mouseCoord[Y] - blockScreenCoord[Y],
    ];

    for (const side of [TOP, BOTTOM]) {
      if (
        this.sideDirectionIsVisible(sides[side].direction) &&
        this.verticalSideCheck(sides[side].coords, relativeMouseCoord)
      ) {
        return side;
      }
    }

    for (const side of [NORTH, EAST, SOUTH, WEST]) {
      if (
        this.sideDirectionIsVisible(sides[side].direction) &&
        this.sideCheck(sides[side].coords, relativeMouseCoord)
      ) {
        return side;
      }
    }
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
      // We're in the bounding box, continue
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
      return true;
    }

    // Target slopes
    const slopeLeftToTarget = slope(screenCoords[leftMost], targetCoord);
    const slopeRightToTarget = slope(screenCoords[rightMost], targetCoord);

    if (
      slopeLeftTop > slopeLeftToTarget  &&
      slopeLeftToTarget > slopeLeftBottom &&
      slopeRightBottom > slopeRightToTarget &&
      slopeRightToTarget > slopeRightTop
    ) {
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

    // Loop over each side to determine the
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
      // We're in the bounding box, continue
    } else {
      return false;
    }

    // Target slopes
    const slopeTopToTarget = slope(screenCoords[topLeft], targetCoord);
    const slopeBottomToTarget = slope(screenCoords[bottomLeft], targetCoord);

    if (
      slopeTopToTarget < topSlope  &&
      slopeBottomToTarget > bottomSlope
    ) {
      return true;
    }

    return false;
  }
}

function slope(a, b) {
  return (b[Y] - a[Y]) / (b[X] - a[X])
}
