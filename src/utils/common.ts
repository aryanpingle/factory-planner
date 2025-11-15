import Point from "@mapbox/point-geometry";

export type RectCoords = [number, number, number, number];

/** Equivalent to `value - (value % mod)` */
export function snap(value: number, mod: number) {
  return value - (value % mod);
}

export function getButton(event: MouseEvent): "LMB" | "MMB" | "RMB" | null {
  if (event.button === 0) return "LMB";
  if (event.button === 1) return "MMB";
  if (event.button === 2) return "RMB";
  return null;
}

/** Get a Point representation of the mouse event's offset coordinates. */
export function mouseCoordsAsPoint(event: MouseEvent): Point {
  return new Point(event.offsetX, event.offsetY);
}

export function assertType<T>(variable: any): T {
  return variable;
}

export function asRectCoords(p1: Point, p2: Point): RectCoords {
  return [
    Math.min(p1.x, p2.x),
    Math.min(p1.y, p2.y),
    Math.max(p1.x, p2.x),
    Math.max(p1.y, p2.y),
  ];
}

export function withMaxDecimal(value: number, precision: number) {
  const original = String(value);
  const withFixed = value.toPrecision(precision);
  if (original.length < withFixed.length) return original;
  else return withFixed;
}

export function fillCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, radius, radius, 0, 0, 2 * Math.PI, false);
  ctx.fill();
  ctx.closePath();
}

export function getMsAndFPS(ms: number): string {
  const fps = ms === 0 ? Number.POSITIVE_INFINITY : Math.ceil(1000 / ms);
  return `${ms.toFixed(2)}ms (${fps} FPS)`;
}
