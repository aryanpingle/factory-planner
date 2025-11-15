import Point from "@mapbox/point-geometry";
import { type StateMachine } from "./StateMachine";
import { Entity } from "./EntityManager";
import { Rectangle } from "./utils";

export enum StateName {
  IDLE = "IDLE",
  PANNING = "PANNING",
  SELECTION = "SELECTION",
  MOVING_SELECTION = "MOVING_SELECTION",
}

export interface IdleState {
  name: StateName.IDLE;
}

export interface PanningState {
  name: StateName.PANNING;
  previousScreenPoint: Point;
  previousState: State;
}

export interface SelectionStateNotSelecting {
  name: StateName.SELECTION;
  selectedEntities: Entity[];
  selectionRectangle: Rectangle;
  isSelecting: false;
}

export interface SelectionStateSelecting {
  name: StateName.SELECTION;
  selectedEntities: Entity[];
  selectionRectangle: Rectangle;
  isSelecting: true;
  startWorldCoords: Point;
  endWorldCoords: Point;
}

export type SelectionState =
  | SelectionStateSelecting
  | SelectionStateNotSelecting;

export interface MovingSelectionState {
  name: StateName.MOVING_SELECTION;
  selectedEntities: Entity[];
  selectionRectangle: Rectangle;
  previousMouseWorldPoint: Point;
}

export type State =
  | IdleState
  | PanningState
  | SelectionState
  | MovingSelectionState;

export interface StateMap {
  [StateName.IDLE]: IdleState;
  [StateName.PANNING]: PanningState;
  [StateName.SELECTION]: SelectionState;
  [StateName.MOVING_SELECTION]: MovingSelectionState;
}

// reference: GlobalEventHandlersEventMap (typescript)
export interface CustomEventHandlersEventMap {
  contextmenu: PointerEvent;
  drag: DragEvent;
  dragend: DragEvent;
  dragenter: DragEvent;
  dragleave: DragEvent;
  dragover: DragEvent;
  dragstart: DragEvent;
  drop: DragEvent;
  keydown: KeyboardEvent;
  keyup: KeyboardEvent;
  mousedown_lmb: MouseEvent;
  mousedown_mmb: MouseEvent;
  mousedown_rmb: MouseEvent;
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

export type TransitionCallback<
  TStateName extends StateName,
  TEventName extends keyof CustomEventHandlersEventMap,
> = (
  currentState: StateMap[TStateName],
  event: CustomEventHandlersEventMap[TEventName],
  stateMachine: StateMachine,
) => void;

export type TransitionTable = {
  [TStateName in StateName]: Partial<{
    [TEventName in keyof CustomEventHandlersEventMap]: TransitionCallback<
      TStateName,
      TEventName
    >;
  }>;
};
