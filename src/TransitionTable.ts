import { PanningState, StateName, TransitionTable } from "./state.types";
import { mouseCoordsAsPoint } from "./utils";

export const transitionTable: TransitionTable = {
  [StateName.IDLE]: {
    mousedown_mmb(currentState, event, stateMachine) {
      // Begin panning
      const screenPoint = mouseCoordsAsPoint(event);
      const panningState: PanningState = {
        name: StateName.PANNING,
        previousState: currentState,
        previousScreenPoint: screenPoint,
      };
      stateMachine.transition(panningState);
    },
  },
  [StateName.PANNING]: {
    mousemove(currentState, event, stateMachine) {
      // Move the camera
      const newScreenPoint = mouseCoordsAsPoint(event);
      const oldScreenPoint = currentState.previousScreenPoint;
      const offset = newScreenPoint.sub(oldScreenPoint);
      stateMachine.camera.position._add(offset);
      // Update the current state
      currentState.previousScreenPoint = newScreenPoint;
    },
    mouseup(currentState, _, stateMachine) {
      stateMachine.transition(currentState.previousState);
    },
  },
};
