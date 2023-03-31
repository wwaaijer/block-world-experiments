import { dragListener } from "./dragListener.mjs";
import { worldBlocks } from "./worldBlocks.mjs";
import { WorldRenderer } from "./WorldRenderer.mjs";

const canvas = document.getElementById('main');
const worldRenderer = new WorldRenderer(canvas);

dragListener(canvas, ({ movementX, movementY }) => {
  worldRenderer.rotate(movementX / 1.5, movementY / 1.5);
});


// worldRenderer.render(worldBlocks);
setInterval(() => worldRenderer.render(worldBlocks), 20);