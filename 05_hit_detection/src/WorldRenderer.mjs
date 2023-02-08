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

  render(worldBlocks) {
    this.clearAndInitializeCanvas();

    worldBlocks.forEach((block) => {
      block.screenLocation = this.coords.worldToScreen(...block.location);
    });

    worldBlocks.sort((a, b) => (b.screenLocation[2] - a.screenLocation[2]));

    for (const worldBlock of worldBlocks) {
      this.blockRenderer.render(worldBlock);
    }

    this.ctx.translate(...this.coords.worldToScreen(0, 0, 1));

    // TODO: properly normalize Mouse position
    const centerScreenCoord = [this.width/2, this.height/2];
    const targetBlockCoord = this.coords.worldToScreen(-0.5, -0.5, -0.5);
    const mouseCoord = [
      this.mouseX - centerScreenCoord[X] - targetBlockCoord[X],
      this.mouseY - centerScreenCoord[Y] - targetBlockCoord[Y],
    ];

    // TODO: loop over the blocks in reverse order
    //    and extend hit detection to take in world block (coords) as well
    this.hitDetection.detect(mouseCoord);
    
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

    // Start the coordinate system from the bottom left corner to make thinking easier
    this.ctx.translate(0, this.height);
    this.ctx.scale(1, -1);

    // Center the drawing
    this.ctx.translate(Math.floor(this.width / 2), Math.floor(this.height / 2));
    
    // Target block 0,0,2 (move screen in opposite direction)
    this.ctx.translate(...this.coords.worldToScreen(0,0,-1));

    // And from the center of the target block for a nice rotation
    this.ctx.translate(...this.coords.worldToScreen(-0.5,-0.5,-0.5));
  }
}
