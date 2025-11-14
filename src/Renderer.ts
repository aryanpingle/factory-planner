import Point from "@mapbox/point-geometry";
import { AppData } from "./types";
import { snap } from "./utils";

const IDENTITY_MATRIX = [1, 0, 0, 1, 0, 0] as const;

const WORLD_GRID_SUB_GAP = 1;
const WORLD_GRID_MAIN_GAP = 10;

export class RenderingSystem {
  canvasElement: AppData["canvasElement"];
  camera: AppData["camera"];
  entityManager: AppData["entityManager"];
  stateMachine: AppData["stateMachine"];

  ctx: CanvasRenderingContext2D;

  constructor(
    canvasElement: AppData["canvasElement"],
    camera: AppData["camera"],
    entityManager: AppData["entityManager"],
    stateMachine: AppData["stateMachine"],
  ) {
    this.canvasElement = canvasElement;
    this.camera = camera;
    this.entityManager = entityManager;
    this.stateMachine = stateMachine;

    this.ctx = this.canvasElement.getContext("2d")!;
  }

  render() {
    const { camera, entityManager } = this;

    // Reset the canvas
    this.ctx.setTransform(...IDENTITY_MATRIX);
    this.ctx.clearRect(0, 0, camera.screenWidth, camera.screenHeight);
    // Set translation and scale
    this.ctx.translate(camera.position.x, camera.position.y);
    this.ctx.scale(camera.zoom, camera.zoom);

    this.drawDynamicGrid();

    this.drawDemoSquare();

    // Draw entities
    const entitiesOnScreen = entityManager.getEntitiesIntersectingRect(
      camera.getScreenRect(),
    );
    entitiesOnScreen.forEach((entity) => entity.render(this));

    // TODO: Use information from StateManager to draw on the HTML canvas
  }

  renderWithDebug() {
    let startTime = Date.now();

    this.render();

    const renderTimeMs = Date.now() - startTime;
    this.drawDebugInfo(renderTimeMs);
  }

  drawDemoSquare() {
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(0, 0, 10, 10);
    this.ctx.fillStyle = "green";
    this.ctx.fillRect(10, 0, 20, 10);
    this.ctx.fillStyle = "blue";
    this.ctx.fillRect(0, 10, 10, 20);
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(10, 10, 20, 20);
  }

  drawDebugInfo(renderTimeMs: number) {
    this.ctx.setTransform(...IDENTITY_MATRIX);

    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, 100, 100);

    this.ctx.fillStyle = "mediumspringgreen";
    this.ctx.textBaseline = "hanging";
    this.ctx.textAlign = "left";
    this.ctx.font = "15px serif";
    this.ctx.fillText(
      `State: ${this.stateMachine.currentState.name}`,
      0,
      0,
      100,
    );
    this.ctx.fillText(
      `FPS: ${Math.min(1000, Math.round(1000 / renderTimeMs))}`,
      0,
      20,
      100,
    );
  }

  drawDynamicGrid() {
    // TODO: Figure out a smarter way to phase out the grid
    if (this.camera.zoom < 7.5) return;

    // Sub grid
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    this.ctx.lineWidth = 1 / this.camera.zoom;
    this._drawDynamicGrid(WORLD_GRID_SUB_GAP);
    // Main grid
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    this.ctx.lineWidth = 1 / this.camera.zoom;
    this._drawDynamicGrid(WORLD_GRID_MAIN_GAP);
  }

  private _drawDynamicGrid(gap: number) {
    const camera = this.camera;

    const screenTopLeftToWorld = camera.screenToWorldPoint(new Point(0, 0));
    const screenBottomRightToWorld = camera.screenToWorldPoint(
      new Point(camera.screenWidth, camera.screenHeight),
    );

    // Horizontal lines
    for (
      let y = snap(screenTopLeftToWorld.y, gap);
      y <= snap(screenBottomRightToWorld.y, gap);
      y += gap
    ) {
      const x1 = screenTopLeftToWorld.x;
      const x2 = screenBottomRightToWorld.x;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y);
      this.ctx.lineTo(x2, y);
      this.ctx.stroke();
    }

    // Vertical lines
    for (
      let x = snap(screenTopLeftToWorld.x, gap);
      x <= snap(screenBottomRightToWorld.x, gap);
      x += gap
    ) {
      const y1 = screenTopLeftToWorld.y;
      const y2 = screenBottomRightToWorld.y;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y1);
      this.ctx.lineTo(x, y2);
      this.ctx.stroke();
    }
  }
}
