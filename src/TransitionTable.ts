import Point from "@mapbox/point-geometry";
import {
  MovingSelectionState,
  PanningState,
  SelectionState,
  StateName,
  TransitionTable,
} from "./state.types";
import { StateMachine } from "./StateMachine";
import { mouseCoordsAsPoint, PointUtils, Rectangle } from "./utils";
import { Key } from "./Key";
import { EntitySelection } from "./EntitySelection";

const KEY_TO_NUDGE_DIRECTION_MAP: Partial<Record<Key, Point>> = {
  [Key.ArrowDown]: new Point(0, +1),
  [Key.ArrowLeft]: new Point(-1, 0),
  [Key.ArrowRight]: new Point(+1, 0),
  [Key.ArrowUp]: new Point(0, -1),
} as const;

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
    keydown(currentState, event, _) {
      const key = event.key as Key;

      if (KEY_TO_NUDGE_DIRECTION_MAP[key]) {
        const offset = KEY_TO_NUDGE_DIRECTION_MAP[key];

        // Update entity positions
        currentState.selection.entities.forEach((entity) => {
          entity.setPosition(
            entity.position.x + offset.x,
            entity.position.y + offset.y,
          );
        });
        // Update selection rectangle
        currentState.selection.calculateRect();
      }
    },
    mousedown_lmb(currentState, event, stateMachine) {
      const { camera } = stateMachine;

      const mouseCoordsInWorld = camera.screenToWorldPoint(
        mouseCoordsAsPoint(event),
      );

      if (
        currentState.selection.selectionRect.containsPoint(mouseCoordsInWorld)
      ) {
        // Transition to moving state
        stateMachine.transition({
          name: StateName.MOVING_SELECTION,
          previousMouseWorldPoint: mouseCoordsInWorld,
          selection: currentState.selection,
        });
      } else {
        beginEntitySelectionOnMousedownLmb(event, stateMachine);
      }
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
        currentState.selection.setEntities(selectedEntities);
      }
    },
    mouseup(currentState, _, stateMachine) {
      if (currentState.selection.entities.length === 0) {
        // Nothing was selected, move to idle state
        stateMachine.transition({ name: StateName.IDLE });
      } else {
        // Stay in selection state
        currentState.isSelecting = false;
      }
    },
  },
  [StateName.MOVING_SELECTION]: {
    mousemove(currentState, event, stateMachine) {
      moveSelectionToMouse(currentState, event, stateMachine);
    },
    mouseup(currentState, _, stateMachine) {
      // Transition to selection state
      stateMachine.transition({
        name: StateName.SELECTION,
        isSelecting: false,
        selection: currentState.selection,
      });
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
    const topmostEntity = entitiesAtClickPoint[entitiesAtClickPoint.length - 1];

    const selection = new EntitySelection();
    selection.setEntities([topmostEntity]);

    stateMachine.transition({
      name: StateName.MOVING_SELECTION,
      previousMouseWorldPoint: mouseCoordsInWorld,
      selection,
    });
  } else {
    // Move to selection state
    const newState: SelectionState = {
      name: StateName.SELECTION,
      selection: new EntitySelection(),
      isSelecting: true,
      startWorldCoords: mouseCoordsInWorld,
      endWorldCoords: mouseCoordsInWorld,
    };
    stateMachine.transition(newState);
  }
}

function moveSelectionToMouse(
  currentState: MovingSelectionState,
  event: MouseEvent,
  stateMachine: StateMachine,
) {
  const { camera } = stateMachine;

  const mouseCoordsInWorld = camera.screenToWorldPoint(
    mouseCoordsAsPoint(event),
  );
  const snappedOffset = PointUtils._roundPoint(
    mouseCoordsInWorld.sub(currentState.previousMouseWorldPoint),
  );

  // Update entity positions
  const { selection } = currentState;
  selection.entities.forEach((entity) => {
    entity.setPosition(
      entity.position.x + snappedOffset.x,
      entity.position.y + snappedOffset.y,
    );
  });
  selection.calculateRect();
  currentState.previousMouseWorldPoint._add(snappedOffset);
}
