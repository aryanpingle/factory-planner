import { Entity, EntityManager } from "./EntityManager";
import { Rectangle } from "./utils";

export class EntitySelection {
  entities: Entity[];
  selectionRect: Rectangle;

  constructor() {
    this.entities = [];
    this.selectionRect = new Rectangle(0, 0, 0, 0);
  }

  setEntities(entities: Entity[]) {
    this.entities = entities;
    this.calculateRect();
  }

  calculateRect() {
    this.selectionRect = EntityManager.getMergedBoundingRect(this.entities);
  }

  clear() {
    this.entities = [];
    this.selectionRect = new Rectangle(0, 0, 0, 0);
  }
}
