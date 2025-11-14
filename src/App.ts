import { Camera } from "./Camera";
import { EntityManager } from "./EntityManager";
import { StateMachine } from "./StateMachine";
import { AppData } from "./types";
import { RenderingSystem as Renderer } from "./Renderer";
import Point from "@mapbox/point-geometry";
import { getButton } from "./utils";
import { CustomEventHandlersEventMap } from "./state.types";

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
    this.stateMachine = new StateMachine(
      this.camera,
      this.canvasElement,
      this.entityManager,
    );

    // Initialize renderer
    this.renderer = new Renderer(
      this.canvasElement,
      this.camera,
      this.entityManager,
      this.stateMachine,
    );

    this.setupGeneralCanvasEventListeners();
    this.setupEventListeners();

    this.renderer.render();
  }

  setupGeneralCanvasEventListeners() {
    // Resize listener
    this.canvasElement.addEventListener(
      "resize",
      () => {
        this.camera.screenWidth = this.canvasElement.width;
        this.camera.screenHeight = this.canvasElement.height;
      },
      {
        passive: true,
      },
    );
    // Zoom / Scroll events
    this.canvasElement.addEventListener("wheel", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (event.ctrlKey) {
        // Zoom using touchpad or ctrl+wheel
        this.zoomOnScroll(event);
      } else {
        // Pan using touchpad or wheel
        this.translateOnScroll(event);
      }
    });
    // Debug
    this.canvasElement.addEventListener("keypress", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (event.key === "D") {
        console.log(this);
      }
    });
  }

  setupEventListeners() {
    this.canvasElement.addEventListener("mousedown", (event) => {
      const button = getButton(event);

      if (button === "LMB") this.stateMachine.onEvent("mousedown_lmb", event);
      else if (button === "MMB")
        this.stateMachine.onEvent("mousedown_mmb", event);
      else if (button === "RMB")
        this.stateMachine.onEvent("mousedown_rmb", event);

      this.renderer.render();
    });

    // Whatever can be easily registered, do them in a loop
    const oneToOneEventNames: Array<keyof CustomEventHandlersEventMap> = [
      "contextmenu",
      "drag",
      "dragend",
      "dragenter",
      "dragleave",
      "dragover",
      "dragstart",
      "drop",
      "keydown",
      "keyup",
      // "mousedown_lmb",
      // "mousedown_mmb",
      // "mousedown_rmb",
      "mouseenter",
      "mouseleave",
      "mousemove",
      "mouseout",
      "mouseover",
      "mouseup",
      "resize",
      "scroll",
      "scrollend",
      "wheel",
    ];
    for (const name of oneToOneEventNames) {
      this.canvasElement.addEventListener(name, (event) => {
        this.stateMachine.onEvent(name, event);
        this.renderer.render();
      });
    }
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
