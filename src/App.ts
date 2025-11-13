import { Camera } from "./Camera";
import { EntityManager } from "./EntityManager";
import { StateMachine } from "./StateMachine";
import { AppData } from "./types";
import { RenderingSystem as Renderer } from "./Renderer";
import Point from "@mapbox/point-geometry";

export class App implements AppData {
  canvasElement: HTMLCanvasElement;
  camera: Camera;
  entityManager: EntityManager;
  stateMachine: StateMachine;
  renderer: Renderer;

  constructor(_canvasElement: HTMLCanvasElement) {
    // STEP: Setup the canvas element
    // STEP: Load and setup all entities using ENTITYMANAGER
    // STEP: Setup events on the canvas with the STATEMANAGER
    // STEP: Setup the CAMERA
    // STEP: render()

    // Store the HTML canvas element
    this.canvasElement = _canvasElement;

    // Initialize camera
    this.camera = new Camera(this.canvasElement);

    // Initialize entity manager
    this.entityManager = new EntityManager();

    // Initialize state machine
    this.stateMachine = new StateMachine(this.camera, this.entityManager);

    // Initialize renderer
    this.renderer = new Renderer(
      this.canvasElement,
      this.camera,
      this.entityManager,
      this.stateMachine,
    );

    this.setupGeneralCanvasEventListeners();

    this.renderer.render();
  }

  setupGeneralCanvasEventListeners() {
    // Resize listener
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
    // Zoom / Scroll events
    this.canvasElement.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (event.ctrlKey) {
          // Zoom using touchpad or ctrl+wheel
          this.zoomOnScroll(event);
        } else {
          // Pan using touchpad or wheel
          this.translateOnScroll(event);
        }
      },
      {
        passive: false,
      },
    );
    // Zoom / Scroll events
    this.canvasElement.addEventListener(
      "keypress",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (event.key === "D") {
          console.log(this);
        }
      },
      {
        passive: false,
      },
    );
  }

  translateOnScroll(event: WheelEvent) {
    // Up scroll = negative value
    // Right scroll = positive value
    const translationPx = new Point(event.deltaX, event.deltaY);
    this.camera.position._sub(translationPx);
    // Re-render
    this.renderer.render();
  }

  zoomOnScroll(event: WheelEvent) {
    // Exponential zooming coefficient - slow down the zooming while zooming out
    const screenPoint = new Point(event.offsetX, event.offsetY);
    const ZOOM_INTENSITY = 0.0075;
    const delta = -event.deltaY; // deltaX is incorrect in cases of ctrl+wheel
    const newZoomLevel = this.camera.zoom * Math.exp(delta * ZOOM_INTENSITY);
    this.camera.zoomAtScreenPoint(newZoomLevel, screenPoint);
    // Re-render
    this.renderer.render();
  }
}
