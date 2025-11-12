import Point from "@mapbox/point-geometry";
import { EntityId } from "./base.types";
import { BaseEntity } from "./entity";
import { Rectangle } from "../utils";

export class FactorySystem<Entity extends BaseEntity> {
    entities: Entity[] = [];
    /** Used to auto-assign unique entity ids  */
    lastEntityId: number = 0;

    private createEntityId(): number {
        return ++this.lastEntityId;
    }

    addEntity(entity: Entity) {
        this.entities.push(entity);
    }

    registerEntity(entity: Entity, id?: EntityId) {
        if (id === undefined) {
            entity.id = this.createEntityId();
        } else {
            entity.id = id;
            this.lastEntityId = Math.max(this.lastEntityId, id);
        }
        this.addEntity(entity);
    }

    getEntity(id: number): Entity {
        if (id < 0 || id >= this.entities.length)
            throw new Error(`Entity with id ${id} does not exist.`);
        return this.entities[id];
    }

    getEntities(ids: Iterable<EntityId>): Entity[] {
        return Array.from(ids).map((id) => this.getEntity(id));
    }

    getActiveEntities(): Entity[] {
        return this.entities;
    }

    getEntitiesContaining(point: Point): Entity[] {
        const entities = this.getActiveEntities();
        return entities.filter((entity) =>
            entity.boundingRect.containsPoint(point),
        );
    }

    getEntitiesIntersecting(rect: Rectangle): Entity[] {
        const entities = this.getActiveEntities();
        return entities.filter((entity) =>
            entity.boundingRect.intersects(rect),
        );
    }

    // --- Static Methods

    getMergedBounds(entities: Entity[]): Rectangle {
        return Rectangle.union(entities.map((entity) => entity.boundingRect));
    }

    serialize(): string {
        const obj = JSON.parse(JSON.stringify(this));

        delete obj["position"];
        delete obj["boundingRect"];

        return JSON.stringify(obj);
    }

    // deserialize(str: string): Entity {
    //     const obj = JSON.parse(str);
    //     const n = new BaseEntity();
    // }
}
