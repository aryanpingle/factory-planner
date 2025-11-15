import Point from "@mapbox/point-geometry";
import { snap } from "./common";

export namespace PointUtils {
  export function _modPoint(point: Point, mod: number) {
    point.x = snap(point.x, mod);
    point.y = snap(point.y, mod);
    return point;
  }

  export function modPoint(point: Point, mod: number) {
    return _modPoint(point, mod);
  }

  export function _roundPoint(point: Point) {
    point.x = Math.round(point.x);
    point.y = Math.round(point.y);
    return point;
  }

  export function roundPoint(point: Point) {
    return _roundPoint(point);
  }
}
