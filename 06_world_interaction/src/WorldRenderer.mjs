import { worldBlocks } from "./worldBlocks.mjs";
import { BlockRenderer } from "./BlockRenderer.mjs";
import { CoordsConverter, normalizeDeg } from "./CoordsConverter.mjs";
import { HitDetection } from "./HitDetection.mjs";
import { sides } from "./sides.mjs";
import { coordSum, X, Y, Z } from "./utils.mjs";

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

    // TODO: move to outside of this class plz
    this.targetMouseBlock;
    this.targetMouseBlockSide;
    this.canvas.addEventListener('click', (e) => {
      // TODO: Long drag also counts as click
      if (this.targetMouseBlock) {
        worldBlocks.push({
          location: coordSum(this.targetMouseBlock.location, sides[this.targetMouseBlockSide].direction),
          type: this.targetMouseBlock.type,
        })
      }
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
    // TODO: Expose the mouse block stuff to the outside of this class. Events?
    delete this.targetMouseBlock;
    delete this.targetMouseBlockSide;
    for (const block of worldBlocks) {
      const sideHit = this.hitDetection.detect(mouseCoord, block.location);
      if (sideHit >= 0) {
        this.targetMouseBlock = block;
        this.targetMouseBlockSide = sideHit;
        // Show preview
        // TODO: This now renders above very thing else.
        //    Add this to the world as a non interactive block?
        this.blockRenderer.render({
          location: coordSum(block.location, sides[sideHit].direction),
          type: 'preview',
        });
        break;
      }
    }
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
