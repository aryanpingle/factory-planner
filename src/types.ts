import { Camera } from "./Camera";
import { EntityManager } from "./EntityManager";
import { RenderingSystem } from "./Renderer";
import { StateMachine } from "./StateMachine";

export interface AppData {
  /** Reference of the HTML canvas element. */
  canvasElement: HTMLCanvasElement;
  /** Information about the canvas with regards to what is being viewed. */
  camera: Camera;
  /** Managing the presence of entities, connections and spatial partitions. */
  entityManager: EntityManager;
  /** Handling the interactive logic of the app. */
  stateMachine: StateMachine;
  /** Rendering everything on the canvas. */
  renderer: RenderingSystem;
}
