import { BlockRenderer } from "./BlockRenderer.mjs";
import { CoordsConverter, normalizeDeg } from "./CoordsConverter.mjs";
import { HitDetection } from "./HitDetection.mjs";
import { X, Y, Z } from "./utils.mjs";

export class WorldRenderer {
  rotation;
  tilt;
  scale;
  width;
  height;
  canvas;
  ctx;
  mouseX;
  mouseY;

  /**
   * 
   * @param {HTMLCanvasElement} canvas 
   */
  constructor(canvas) {
    this.rotation = 45;
    this.tilt = 30;

    this.scale = 50 * window.devicePixelRatio;
    
    this.width = window.innerWidth * window.devicePixelRatio;
    this.height = window.innerHeight * window.devicePixelRatio;
    
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    canvas.style.width = window.innerWidth;
    canvas.style.height = window.innerHeight;
    
    canvas.width = this.width;
    canvas.height = this.height;

    this.canvas.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX * window.devicePixelRatio;
      this.mouseY = this.height - e.clientY * window.devicePixelRatio;
    });

    this.coords = new CoordsConverter();
    this.blockRenderer = new BlockRenderer(this);
    this.hitDetection = new HitDetection(this);
  }

  /**
   * 
   * @param {{location:[number, number, number], type: string}[]} worldBlocks 
   */
  render(worldBlocks) {
    this.clearAndInitializeCanvas();

    worldBlocks.forEach((block) => {
      block.screenLocation = this.coords.worldToScreen(...block.location);
    });

    worldBlocks.sort((a, b) => (b.screenLocation[Z] - a.screenLocation[Z]));

    const cameraTarget = [0,0,0];
    const cameraTargetBlockCenter = true;
    if (cameraTargetBlockCenter) {
      cameraTarget[X] += 0.5;
      cameraTarget[Y] += 0.5;
      cameraTarget[Z] += 0.5;
    }

    const cameraScreenOffset = this.coords.worldToScreen(-cameraTarget[X], -cameraTarget[Y], -cameraTarget[Z]);

    this.ctx.translate(...cameraScreenOffset);

    // Loop over the blocks back to front for rendering
    for (const block of worldBlocks) {
      this.blockRenderer.render(block);
    }

    const centerScreenCoord = [this.width/2, this.height/2];
    const mouseCoord = [
      this.mouseX - centerScreenCoord[X] - cameraScreenOffset[X],
      this.mouseY - centerScreenCoord[Y] - cameraScreenOffset[Y],
    ];

    // Loop over the blocks front to back for hit detection
    worldBlocks.reverse();
    for (const block of worldBlocks) {
      if (this.hitDetection.detect(mouseCoord, block.location) >= 0) {
        break;
      }
    }
    
    // Indicate 0,0,0
    // this.drawRect([0, 0], 4, 'white');
  }

  setRotation(rotation, tilt) {
    this.rotation = normalizeDeg(rotation); 
    this.tilt = normalizeDeg(tilt);
  }

  rotate(rotationChange, tiltChange) {
    this.setRotation(
      this.rotation + rotationChange,
      this.tilt + tiltChange,
    );
  }

  clearAndInitializeCanvas() {
    this.coords.calculateConversionMatrix(this.rotation, this.tilt, this.scale);

    // Clear the canvas
    this.canvas.width = this.width;

    // Draw from center
    this.ctx.translate(Math.floor(this.width / 2), Math.floor(this.height / 2));
    
    // Start the coordinate system from the bottom left corner to make thinking easier
    this.ctx.scale(1, -1);
  }
}
