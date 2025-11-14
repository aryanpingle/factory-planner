import { AppData } from "./types";
import {
  CustomEventHandlersEventMap,
  IdleState,
  State,
  StateName,
  TransitionCallback,
} from "./state.types";
import { transitionTable } from "./TransitionTable";

export class StateMachine {
  camera: AppData["camera"];
  canvasElement: AppData["canvasElement"];
  entityManager: AppData["entityManager"];

  currentState: State;

  constructor(
    camera: AppData["camera"],
    canvasElement: AppData["canvasElement"],
    entityManager: AppData["entityManager"],
  ) {
    this.camera = camera;
    this.canvasElement = canvasElement;
    this.entityManager = entityManager;

    const idleState: IdleState = { name: StateName.IDLE };
    this.currentState = idleState;
  }

  transition(newState: State) {
    this.currentState = newState;
  }

  onEvent<TEventName extends keyof CustomEventHandlersEventMap>(
    eventName: TEventName,
    event: CustomEventHandlersEventMap[TEventName],
  ) {
    const callbackFn = transitionTable[this.currentState.name][
      eventName
    ] as TransitionCallback<StateName, TEventName>;

    if (callbackFn) {
      callbackFn?.(this.currentState, event, this);
    } else {
      console.warn(
        `No transition function registered for (state=${this.currentState.name}, eventName=${eventName})`,
      );
    }
  }
}
