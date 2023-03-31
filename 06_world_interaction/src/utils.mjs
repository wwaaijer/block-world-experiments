export const X = 0;
export const Y = 1;
export const Z = 2;

export const TOP = 0;
export const BOTTOM = 1;
export const NORTH = 2;
export const EAST = 3;
export const SOUTH = 4;
export const WEST = 5;

export function coordSum(a, b) {
  return [
    a[X] + b[X],
    a[Y] + b[Y],
    a[Z] + b[Z],
  ]
}