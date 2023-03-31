import { X, Y, Z } from "./utils.mjs";

// Colors are in HSL format
// Should not be have an L value lower then 10.
// Because cube borders are drawn slightly darker (L is decrease by 10).
const Color = {
  leaves: [98,58,30],
  grass:  [87,47,37],
  log:    [44,65,30],
}

export class BlockRenderer {
  constructor(worldRenderer) {
    this.worldRenderer = worldRenderer;
  }

  render(block) {
    this.moveCanvas(block.location);
    this.drawBlock(block);
    this.resetCanvas();
  }

  moveCanvas(location) {
    const { ctx, coords } = this.worldRenderer;
    ctx.save();
    ctx.translate(...coords.worldToScreen(...location));
  }

  resetCanvas() {
    this.worldRenderer.ctx.restore();
  }

  drawBlock(block) {
    this.drawCube(Color[block.type]);
  }

  drawCube(color) {
    //  Visualization of a cube (tilted 35 deg and rotated 45 deg)
    //    with markers for the axis (XYZ)
    //    and the cardinal directions (NESW)
    //                          
    //               .          
    //          N         E     
    //     .                   .
    //          W         S     
    //     .         Z         .
    //               -          
    //     Y         -         X
    //          -    -    -     
    //               0          
    
    const { tilt, rotation } = this.worldRenderer;

    // TODO: might be able to simplify with screen coords instead of rotation/tilt?
  
    // 0 - 180 deg tilt
    const topIsVisible = tilt < 180;
    // 90 - 270 deg tilt
    const upSideDown = tilt >= 90 && tilt < 270;
  
    // 0 - 180 deg rotation (quarter 1 and 2)
    const rotationQ12 = rotation < 180;
    // 90 - 270 deg rotation (quarter 2 and 3)
    const rotationQ23 = rotation >= 90 && rotation < 270;
    
    const northIsVisible = upSideDown ? !rotationQ23 : rotationQ23;
    const westIsVisible = upSideDown ? !rotationQ12 : rotationQ12;
  
    // Top face
    if (topIsVisible) {
      this.drawCubeFace([0,0,1], [1,1,1], color);
      const topIndicator = this.worldRenderer.coords.worldToScreen(...[0.5,0.5,1]);
      this.worldRenderer.ctx.fillStyle = 'red';
      this.worldRenderer.ctx.fillRect(topIndicator[0] - 2, topIndicator[1] - 2, 4, 4);
    }
  
    // North face
    if (northIsVisible){
      this.drawCubeFace([0,1,0], [1,1,1], color);
      const northIndicator = this.worldRenderer.coords.worldToScreen(...[0.5,1,0.5]);
      this.worldRenderer.ctx.fillStyle = 'white';
      this.worldRenderer.ctx.fillRect(northIndicator[0] - 2, northIndicator[1] - 2, 4, 4);
    }
  
    // East face
    if (!westIsVisible)
      this.drawCubeFace([1,0,0], [1,1,1], color);
  
    // South face
    if (!northIsVisible)
      this.drawCubeFace([0,0,0], [1,0,1], color);
  
    // West face
    if (westIsVisible)
      this.drawCubeFace([0,0,0], [0,1,1], color);
  
    // Bottom face
    if (!topIsVisible) {
      this.drawCubeFace([0,0,0], [1,1,0], color);
      const bottomIndicator = this.worldRenderer.coords.worldToScreen(...[0.5,0.5,0]);
      this.worldRenderer.ctx.fillStyle = 'blue';
      this.worldRenderer.ctx.fillRect(bottomIndicator[0] - 2, bottomIndicator[1] - 2, 4, 4);
    }
  } 
  
  /**
    * Expects only 2 axis to change between start and end.
    * Will draw rectangle between those 2 points.
    * Colored fill and a slightly black border.
    * 
    * @param {[number,number,number]} start
    * @param {[number,number,number]} end
    * @param {[number,number,number]} color
    */
  drawCubeFace(start, end, color) {
    const { ctx, coords } = this.worldRenderer;

    const xDiff = start[X] !== end[X];
    const yDiff = start[Y] !== end[Y];
    const zDiff = start[Z] !== end[Z];
  
    const current = [...start];
  
    ctx.beginPath();
    ctx.moveTo(...coords.worldToScreen(...current));
  
    if (xDiff) {
      current[X] = end[X];
      ctx.lineTo(...coords.worldToScreen(...current));
    }
  
    if (yDiff) {
      current[Y] = end[Y];
      ctx.lineTo(...coords.worldToScreen(...current));
    }
  
    if (zDiff) {
      current[Z] = end[Z];
      ctx.lineTo(...coords.worldToScreen(...current));
    }
  
    if (xDiff) {
      current[X] = start[X];
      ctx.lineTo(...coords.worldToScreen(...current));
    }
  
    if (yDiff) {
      current[Y] = start[Y];
      ctx.lineTo(...coords.worldToScreen(...current));
    }
  
    if (zDiff) {
      current[Z] = start[Z];
      ctx.lineTo(...coords.worldToScreen(...current));
    }
  
    ctx.fillStyle = hsl(color);
    ctx.fill();
    
    const darkerColor = [color[0], color[1], color[2] - 10];
    ctx.strokeStyle = hsl(darkerColor);
    ctx.stroke();
  }
}

function hsl([h, s, l]) {
  return `hsl(${h}deg,${s}%,${l}%)`
}
