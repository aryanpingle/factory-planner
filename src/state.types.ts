import Point from "@mapbox/point-geometry";
import { type StateMachine } from "./StateMachine";

export enum StateName {
  IDLE = "idle",
  PANNING = "panning",
}

export interface IdleState {
  name: StateName.IDLE;
}

export interface PanningState {
  name: StateName.PANNING;
  previousScreenPoint: Point;
  previousState: State;
}

export type State = IdleState | PanningState;

export interface StateMap {
  [StateName.IDLE]: IdleState;
  [StateName.PANNING]: PanningState;
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
