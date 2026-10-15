import { Vector } from "excalibur";

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

// Liest die Farbe an einer Position. Gibt null zurück, wenn die Position außerhalb der Karte liegt.
export const getPixelColor = (
  imageData: ImageData,
  pos: Vector,
): RGBA | null => {
  const x = Math.floor(pos.x);
  const y = Math.floor(pos.y);

  if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) {
    return null;
  }

  const i = (y * imageData.width + x) * 4;
  return {
    r: imageData.data[i],
    g: imageData.data[i + 1],
    b: imageData.data[i + 2],
    a: imageData.data[i + 3],
  };
};

// Vergleicht zwei Farben. Mit tolerance > 0 dürfen die Kanäle etwas abweichen.
export const colorsMatch = (
  a: RGBA,
  b: RGBA,
  tolerance: number = 0,
): boolean => {
  return (
    Math.abs(a.r - b.r) <= tolerance &&
    Math.abs(a.g - b.g) <= tolerance &&
    Math.abs(a.b - b.b) <= tolerance &&
    Math.abs(a.a - b.a) <= tolerance
  );
};
