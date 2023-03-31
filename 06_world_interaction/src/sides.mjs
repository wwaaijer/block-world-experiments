/** @type {{direction: [number,number,number], coords: [number,number,number][]}[]} */
export const sides = [
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