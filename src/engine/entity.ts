import Point from "@mapbox/point-geometry";
import { Rectangle } from "../utils";
import { EntityId, SocketId } from "./base.types";

export enum EntityType {
    DUMMY = "dummy",
}

/**
 * Okay, so.
 *
 * [core/engine] Entities:
 * --- Entities have a name, id, type, input sockets, output sockets, type-specific data
 * --- They are the building blocks of the graph
 * --- Each socket belonging to an entity is just JSON data, initialized at runtime
 *
 * [core/engine] Connections / edges:
 * --- Stored independently of the entities
 * --- Should be O(1) time to find the connection between two sockets
 * --- Should be two-way searchable
 *
 * UI will help in:
 * --- Changing coordinates
 * --- Easy copy-pasting of entities
 * --- Easy manipulation of entities
 * --- Easy connection making between entities
 * --- Seeing part flow rate between entities
 */

export abstract class BaseEntity {
    abstract type: EntityType;
    abstract name: string;
    /** Width of the bounding box containing the rendered entity. */
    abstract width: number;
    /** Height of the bounding box containing the rendered entity. */
    abstract height: number;

    inputSockets: SocketId[];
    outputSockets: SocketId[];

    /** Unique id of the entity, set during runtime. */
    id: EntityId = -1;

    /** Coordinates of the center of the entity. */
    position: Point;
    /** Cached value of the entity's bounding rectangle. */
    boundingRect: Rectangle;

    constructor() {
        this.inputSockets = [];
        this.outputSockets = [];
        this.position = new Point(0, 0);
        this.boundingRect = this.computeBoundingRect();
    }

    /**
     * Render the entity using the canvas object provided. Assumes scale and
     * translation have been set.
     */
    abstract render(): void;
    // abstract render(canvas: Canvas): void;

    /**
     * Computes and caches the bounding rect of this entity.
     */
    computeBoundingRect(): Rectangle {
        this.boundingRect = Rectangle.fromCenter(
            this.position,
            this.width,
            this.height,
        );
        return this.boundingRect;
    }
}
