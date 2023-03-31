export function dragListener(element, callback) {
  const pointerDownListener = (event) => {
    event.preventDefault();
    element.setPointerCapture(event.pointerId); // TODO: this blocks mouse detection in the rest of the engine
    element.addEventListener('pointerup', pointerUpListener);
    element.addEventListener('pointermove', pointerMoveListener);
  };

  const pointerMoveListener = (event) => {
    const buttons = [
      event.buttons / 1 % 2 >= 1, // left
      event.buttons / 2 % 2 >= 1, // right
      event.buttons / 4 % 2 >= 1, // middle
      event.buttons / 8 % 2 >= 1, // back
      event.buttons / 16 % 2 >= 1, // forward
    ];

    callback({
      buttons,
      movementX: event.movementX,
      movementY: event.movementY,
    })
  };

  const pointerUpListener = (event) => {
    event.preventDefault();
    element.releasePointerCapture(event.pointerId);
    element.removeEventListener('pointerup', pointerUpListener);
    element.removeEventListener('pointermove', pointerMoveListener);
  };
  
  element.addEventListener('pointerdown', pointerDownListener);
}