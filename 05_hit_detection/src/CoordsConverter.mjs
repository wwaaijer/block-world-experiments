export class CoordsConverter {
  calculateConversionMatrix(rotation, tilt, scale) {
    const rotationRad = degToRad(rotation);
    const tiltRad = degToRad(tilt);
    
    this.xX = Math.cos(rotationRad) * scale; // How much screen X to add for world X
    this.yX = - Math.sin(rotationRad) * scale; // How much screen X to add for world Y
    
    this.xY = Math.sin(tiltRad) * Math.sin(rotationRad) * scale;
    this.yY = Math.sin(tiltRad) * Math.cos(rotationRad) * scale;
    this.zY = Math.cos(tiltRad) * scale;
    
    this.xZ = Math.cos(tiltRad) * Math.sin(rotationRad) * scale;
    this.yZ = Math.cos(tiltRad) * Math.cos(rotationRad) * scale;
    this.zZ = - Math.sin(tiltRad) * scale;
  }

  worldToScreen(x, y, z) {
    const screenX = (x * this.xX + y * this.yX);
    const screenY = (x * this.xY + y * this.yY + z * this.zY);
    const screenZ = (x * this.xZ + y * this.yZ + z * this.zZ);
    
    return [screenX, screenY, screenZ];
  }
}

export function normalizeDeg(deg) {
  const normalizedDeg = deg % 360;
  
  if (normalizedDeg < 0) {
    return normalizedDeg + 360;
  }

  return normalizedDeg;
}

export function degToRad(deg) {
  return (normalizeDeg(deg) / 360) * 2 * Math.PI;
}
