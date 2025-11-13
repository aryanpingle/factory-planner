import Point from "@mapbox/point-geometry";
import { Camera } from "./Camera";

// TODO: This is a chore to implement, not handling this for now
export interface Serializable {
    serialize(): string;
    static deserialize(str: string): Serializable;
}

export class RenderingSystem {
    // Drawing and handling the canvas, and converting between canvas and world points
    camera;
    // Managing the presence of entities, connections and spatial partitions
    entityManager;
    // Handling interactivity of the app
    stateManager;

    canvasElement: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor(_canvasElement: HTMLCanvasElement) {
        this.canvasElement = _canvasElement;
        this.ctx = this.canvasElement.getContext("2d")!;

        this.ctx.translate()

        this.camera = new Camera(_canvasElement);
    }

    initialize(_canvasElement: HTMLCanvasElement) {
        // STEP: Setup the canvas element
        // STEP: Load and setup all entities using ENTITYMANAGER
        // STEP: Setup events on the canvas with the STATEMANAGER
        // STEP: Setup the CAMERA
        // STEP: render()
    }

    render() {
        // Step 1: get the current screen space area from CAMERA
        // Step 2: Get all entities intersecting the the screen space from ENTITYMANAGER
        // Step 3: Use information from STATEMANAGER to draw on the HTML canvas
    }

    // clear() {
    //     // Set scale to 1:1
    //     this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    //     this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    // }

    /**
     * Change camera info when canvas is resized.
     */
    setupCanvasResizeEventListener() {
        this.canvasElement.addEventListener(
            "resize",
            () => {
                console.log(
                    "[CONFIRM THIS] setupCanvasResizeEventListener > this",
                    this,
                );
                this.camera.screenWidth = this.canvasElement.width;
                this.camera.screenHeight = this.canvasElement.height;
            },
            {
                passive: true,
            },
        );
    }

    simpleScroll(event: WheelEvent, app: App) {
        // Translation
        const translationPx = new Point(-event.deltaX, -event.deltaY);
        app.translateBy(translationPx);
    }

    simpleZoom(event: WheelEvent, app: App) {
        // Exponential zoom
        const ZOOM_INTENSITY = 0.0075;
        const delta = -event.deltaY;
        const newScale = app.scale * Math.exp(delta * ZOOM_INTENSITY);
        const canvasPoint = new Point(event.offsetX, event.offsetY);
        app.scaleFromPoint(newScale, canvasPoint);
    }

    render() {
        
    }
}
