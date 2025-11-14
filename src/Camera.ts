import Point from "@mapbox/point-geometry";
import { AppData } from "./types";
import { Rectangle } from "./utils";

//  1 S(unit) = 1 W(unit) ( 1x zoom)
// 10 S(unit) = 1 (Wunit) (10x zoom)

//     screenPoint = (worldPoint * zoom) - cameraPosition
// <=> worldPoint  = (screenPoint - cameraPosition) / zoom

const MAX_SCALE = 100;
const MIN_SCALE = 0.0025;

export class Camera {
  /** Width of screen space */
  screenWidth: number;
  /** Height of screen space */
  screenHeight: number;
  /** Position of the camera in screen-space units. */
  position: Point;
  /** Level of zoom into the world-space (0, 0) coordinates. */
  zoom: number;

  constructor(canvasElement: AppData["canvasElement"]) {
    this.screenWidth = canvasElement.width;
    this.screenHeight = canvasElement.height;

    // Position the camera so that the world-space (0, 0) is at the center of the screen
    this.position = new Point(this.screenWidth / 2, this.screenHeight / 2);
    // 10px on the screen = 1 world-space unit
    this.zoom = 10;
  }

  getScreenRect(): Rectangle {
    return new Rectangle(0, 0, this.screenWidth, this.screenHeight);
  }

  screenToWorldPoint(screenPoint: Point): Point {
    const worldPoint = screenPoint.sub(this.position)._div(this.zoom);
    return worldPoint;
  }

  worldToScreenPoint(worldPoint: Point): Point {
    const screenPoint = worldPoint.mult(this.zoom)._sub(this.position);
    return screenPoint;
  }

  screenToWorldRect(screenRect: Rectangle): Rectangle {
    const topLeft = this.screenToWorldPoint(
      new Point(screenRect.x1, screenRect.y1),
    );
    const bottomRight = this.screenToWorldPoint(
      new Point(screenRect.x2, screenRect.y2),
    );
    return Rectangle.fromTwoPoints(topLeft, bottomRight);
  }

  worldToScreenRect(worldRect: Rectangle): Rectangle {
    const topLeft = this.worldToScreenPoint(
      new Point(worldRect.x1, worldRect.y1),
    );
    const bottomRight = this.worldToScreenPoint(
      new Point(worldRect.x2, worldRect.y2),
    );
    return new Rectangle(topLeft.x, topLeft.y, bottomRight.x, bottomRight.y);
  }

  /**
   * Zooms in to / out of the given screen point such that its world position remains the same.
   */
  zoomAtScreenPoint(newZoomLevel: number, screenPoint: Point) {
    // Constrain the new zoom level
    newZoomLevel = Math.max(MIN_SCALE, newZoomLevel);
    newZoomLevel = Math.min(MAX_SCALE, newZoomLevel);

    // Ignore if there's no change
    if (newZoomLevel === this.zoom) return;

    // Convert mouse position from screen  to world position before scaling
    const oldWorldPoint = this.screenToWorldPoint(screenPoint);
    // Set the new scale
    this.zoom = newZoomLevel;
    // Convert mouse position on canvas to world position after scaling
    const newWorldPoint = this.screenToWorldPoint(screenPoint);

    // The same canvas position should point to the
    // same world position before and after
    const offset = newWorldPoint.sub(oldWorldPoint)._mult(newZoomLevel);
    // In world-space, we should translate by `-offset`
    // So in canvas-space, we should translate by `newScale * offset`
    // (negative removed because translation of canvas is inverted)
    this.position._add(offset);
  }
}
