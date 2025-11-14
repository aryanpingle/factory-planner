import Point from "@mapbox/point-geometry";
import { Rectangle } from "./utils";
import { RenderingSystem } from "./Renderer";

export type EntityId = number;

export abstract class Entity<TData extends any = unknown> {
  id: number = -1;

  /** Coordinates of the top left of the entity's bounding box. */
  readonly position: Point = new Point(0, 0);

  abstract width: number;
  abstract height: number;
  abstract data: TData;

  /** Cached value of the bounding rectangle. Computed at runtime. */
  boundingRect?: Rectangle;

  /** Use the renderer's rendering context to draw the entity. */
  abstract render(renderer: RenderingSystem): void;

  abstract serialize(): string;

  setPosition(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
    this.computeBoundingRect();
  }

  computeBoundingRect() {
    this.boundingRect = Rectangle.fromTopLeft(
      this.position,
      this.width,
      this.height,
    );
  }
}

export class EntityManager {
  entities: Map<EntityId, Entity>;
  largestEntityId: EntityId;

  constructor() {
    this.entities = new Map();
    this.largestEntityId = -1;
  }

  getEntities(): Array<Entity> {
    return Array.from(this.entities.values());
  }

  getEntity(id: EntityId): Entity | undefined {
    return this.entities.get(id);
  }

  /**
   * Create a entity id that is unique among all registered entities so far.
   */
  createEntityId() {
    return ++this.largestEntityId;
  }

  /**
   * Registers the provided entity with the prvided entity id.
   * Overrides existing entry, if any.
   */
  registerEntity(id: number, entity: Entity) {
    if (this.entities.has(id)) {
      console.error(
        `Entity with id = ${id} already exists, will be overridden`,
      );
    }
    this.entities.set(id, entity);
  }

  removeEntity(id: number): boolean {
    return this.entities.delete(id);
  }

  getEntitiesIntersectingRect(rect: Rectangle): Array<Entity> {
    return this.getEntities().filter((entity) =>
      entity.boundingRect?.intersects(rect),
    );
  }

  getEntitiesContainingPoint(point: Point): Array<Entity> {
    return this.getEntities().filter((entity) =>
      entity.boundingRect?.containsPoint(point),
    );
  }

  // --- Static Methods

  static getMergedBoundingRect(entities: Entity[]): Rectangle {
    const boundingRects = entities
      .map((entity) => entity.boundingRect)
      .filter((entity) => entity !== undefined);
    return Rectangle.union(boundingRects);
  }
}
