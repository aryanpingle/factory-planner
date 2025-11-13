import Point from "@mapbox/point-geometry";
import { AppData } from "./types";

enum StateName {
  IDLE = "idle",
  PANNING = "panning",
}

interface IdleState {
  name: StateName.IDLE;
}

interface PanningState {
  name: StateName.PANNING;
  startCoords: Point;
  previousState: State;
}

type State = IdleState | PanningState;

// reference: GlobalEventHandlersEventMap (typescript)
interface GlobalEventHandlersEventMap {
  click: PointerEvent;
  contextmenu: PointerEvent;
  drag: DragEvent;
  dragend: DragEvent;
  dragenter: DragEvent;
  dragleave: DragEvent;
  dragover: DragEvent;
  dragstart: DragEvent;
  drop: DragEvent;
  keydown: KeyboardEvent;
  keypress: KeyboardEvent;
  keyup: KeyboardEvent;
  mousedown: MouseEvent;
  mouseenter: MouseEvent;
  mouseleave: MouseEvent;
  mousemove: MouseEvent;
  mouseout: MouseEvent;
  mouseover: MouseEvent;
  mouseup: MouseEvent;
  resize: UIEvent;
  scroll: Event;
  scrollend: Event;
  wheel: WheelEvent;
}

export class StateMachine {
  camera: AppData["camera"];
  entityManager: AppData["entityManager"];

  currentState: State;

  constructor(
    camera: AppData["camera"],
    entityManager: AppData["entityManager"],
  ) {
    this.camera = camera;
    this.entityManager = entityManager;

    // Set the current state
    const idleState: IdleState = { name: StateName.IDLE };
    this.currentState = idleState;
  }

  transition(newState: State) {
    this.currentState = newState;
  }

  // Something like:
  onEvent<T extends keyof GlobalEventHandlersEventMap>(
    eventName: T,
    event: GlobalEventHandlersEventMap[T],
  ) {
    console.log("Received event:", eventName);
    console.log("Event:", event);
  }
}
