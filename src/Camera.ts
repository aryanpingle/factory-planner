import Point from "@mapbox/point-geometry";

// Reference:
// worldPoint = screenPoint
// screenPoint = worldPoint * scale + translation

export class Camera {
    /** Essentially the width of screen space */
    screenWidth: number;
    /** Height of screen space */
    screenHeight: number;

    /**
     * Positive translation moves the canvas rendering context to the bottom right
     * (i.e. camera moves to the top left)
     */
    canvasTranslation: Point;
    /**
     * Increased scaling zooms the camera into the canvas context's (0, 0) coordinate.
     */
    canvasScale: number;

    constructor(canvasElement: HTMLCanvasElement) {
        this.screenWidth = canvasElement.width;
        this.screenHeight = canvasElement.height;

        this.canvasTranslation = new Point(0, 0);
        this.canvasScale = 1;
    }

    screenToWorldPoint(screenPoint: Point) {
        // worldPoint = -translation/scale + canvasPoint/scale
        const worldTopLeft = this.translation.mult(-1).div(this.scale);
        const displacement = screenPoint.div(this.scale);
        const worldPoint = worldTopLeft.add(displacement);
        return worldPoint;
    }

    worldPointToCanvasPoint(worldPoint: Point) {
        // worldPoint = -translation/scale + canvasPoint/scale
        // canvasPoint = worldPoint*scale + translation
        const canvasPoint = worldPoint.mult(this.scale).add(this.translation);
        return canvasPoint;
    }
}
