import { EntityManager } from "./EntityManager";
import {
  PanningState,
  SelectionState,
  StateName,
  TransitionTable,
} from "./state.types";
import { StateMachine } from "./StateMachine";
import { mouseCoordsAsPoint, Rectangle } from "./utils";

export const transitionTable: TransitionTable = {
  [StateName.IDLE]: {
    mousedown_lmb(_, event, stateMachine) {
      beginEntitySelectionOnMousedownLmb(event, stateMachine);
    },
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
  [StateName.SELECTION]: {
    mousedown_lmb(currentState, event, stateMachine) {
      const { camera } = stateMachine;

      const mouseCoordsInWorld = camera.screenToWorldPoint(
        mouseCoordsAsPoint(event),
      );

      if (currentState.selectionRectangle.containsPoint(mouseCoordsInWorld)) {
        // Start moving the selection
        // TODO: Implement this
      } else {
        beginEntitySelectionOnMousedownLmb(event, stateMachine);
      }
    },
    mousemove(currentState, event, stateMachine) {
      const { camera, entityManager } = stateMachine;

      if (currentState.isSelecting) {
        const mouseCoordsInWorld = camera.screenToWorldPoint(
          mouseCoordsAsPoint(event),
        );
        const selectionRectangle = Rectangle.fromTwoPoints(
          currentState.startWorldCoords,
          mouseCoordsInWorld,
        );
        const selectedEntities =
          entityManager.getEntitiesIntersectingRect(selectionRectangle);

        // Update selection
        currentState.endWorldCoords = mouseCoordsInWorld;
        currentState.selectedEntities = selectedEntities;
        currentState.selectionRectangle =
          EntityManager.getMergedBoundingRect(selectedEntities);
      }
    },
    mouseup(currentState, _, stateMachine) {
      if (currentState.selectedEntities.length === 0) {
        // Nothing was selected, move to idle state
        stateMachine.transition({ name: StateName.IDLE });
      } else {
        // Stay in selection state
        currentState.isSelecting = false;
      }
    },
  },
};

/**
 * Selecting entities is a common thing, so this has been extracted to its own function.
 *
 * If the mouse has clicked on an existing entity -> selects and begins moving state
 * If the mouse has clicked on blank space -> begins selection state
 */
function beginEntitySelectionOnMousedownLmb(
  event: MouseEvent,
  stateMachine: StateMachine,
) {
  const { camera } = stateMachine;
  const screenPoint = mouseCoordsAsPoint(event);
  const mouseCoordsInWorld = camera.screenToWorldPoint(screenPoint);

  const entitiesAtClickPoint =
    stateMachine.entityManager.getEntitiesContainingPoint(mouseCoordsInWorld);

  if (entitiesAtClickPoint.length) {
    // If an entity exists at the mouse position, select and start moving it
    // TODO: Implement this
  } else {
    // Move to selection state
    const newState: SelectionState = {
      name: StateName.SELECTION,
      selectedEntities: entitiesAtClickPoint,
      selectionRectangle:
        EntityManager.getMergedBoundingRect(entitiesAtClickPoint),
      isSelecting: true,
      startWorldCoords: mouseCoordsInWorld,
      endWorldCoords: mouseCoordsInWorld,
    };
    stateMachine.transition(newState);
  }
}
