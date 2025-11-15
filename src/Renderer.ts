import Point from "@mapbox/point-geometry";
import { AppData } from "./types";
import { getMsAndFPS, Rectangle, snap } from "./utils";
import { StateName } from "./state.types";

const IDENTITY_MATRIX = [1, 0, 0, 1, 0, 0] as const;

const WORLD_GRID_SUB_GAP = 1;
const WORLD_GRID_MAIN_GAP = 10;

export class RenderingSystem {
  canvasElement: AppData["canvasElement"];
  camera: AppData["camera"];
  entityManager: AppData["entityManager"];
  stateMachine: AppData["stateMachine"];

  ctx: CanvasRenderingContext2D;

  frameDebugInfo: { renderTimeMs: number; entitiesDrawn: number };

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

    this.frameDebugInfo = {
      entitiesDrawn: 0,
      renderTimeMs: 0,
    };

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

    // Draw entities
    const entitiesOnScreen = entityManager.getEntitiesIntersectingRect(
      camera.screenToWorldRect(camera.getScreenRect()),
    );
    this.frameDebugInfo.entitiesDrawn = entitiesOnScreen.length;
    entitiesOnScreen.forEach((entity) => entity.render(this));

    this.renderStateSpecificInformation();
  }

  renderStateSpecificInformation() {
    const currentState = this.stateMachine.currentState;

    if (currentState.name === StateName.SELECTION) {
      this.ctx.lineWidth = 1 / this.camera.zoom;
      this.ctx.strokeStyle = "hsl(195, 100%, 50%)";
      this.ctx.fillStyle = "hsla(195, 100%, 50%, 0.1)";

      // Rect around each selected entity that is present on screen
      const screenRect = this.camera.screenToWorldRect(
        this.camera.getScreenRect(),
      );
      currentState.selectedEntities.forEach((entity) => {
        if (entity.boundingRect?.intersects(screenRect)) {
          this.ctx.strokeRect(...entity.boundingRect.xywh());
        }
      });

      // Rect around the union of all selected entities
      this.ctx.strokeRect(...currentState.selectionRectangle.xywh());

      if (currentState.isSelecting) {
        // Rect around the selection area
        const selectionRect = Rectangle.fromTwoPoints(
          currentState.startWorldCoords,
          currentState.endWorldCoords,
        );
        this.ctx.strokeRect(...selectionRect.xywh());
        this.ctx.fillRect(...selectionRect.xywh());
      }
    }
  }

  renderWithDebug() {
    const renderStartTime = Date.now();
    this.render();
    this.frameDebugInfo.renderTimeMs = Date.now() - renderStartTime;

    this.drawDebugInfo();
  }

  drawDebugInfo() {
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
      getMsAndFPS(this.frameDebugInfo.renderTimeMs),
      0,
      20,
      100,
    );
    this.ctx.fillText(
      `Entities: ${this.frameDebugInfo.entitiesDrawn}`,
      0,
      40,
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
