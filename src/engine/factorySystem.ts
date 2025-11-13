import Point from "@mapbox/point-geometry";
import { EntityId, SocketId } from "./base.types";
import { BaseEntity } from "./entity";
import { Rectangle } from "../utils";
import { Socket } from "./socket";

export class FactorySystem<Entity extends BaseEntity> {
    entities: Map<EntityId, Entity> = new Map();

    /** Used to auto-assign unique entity ids  */
    lastEntityId: number = 0;

    sockets: Map<SocketId, Socket> = new Map();
    /**
     * Undirected map of socket connections, so every connection will have two entries in the map.
     */
    socketConnections: Map<SocketId, SocketId> = new Map();

    private createEntityId(): number {
        return ++this.lastEntityId;
    }

    addEntity(entity: Entity) {
        if (entity.id === -1) {
            console.error("Refused to add entity with id -1", entity);
            throw new Error();
        }

        this.entities.set(entity.id, entity);
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
        const result = this.entities.get(id);
        if (result === undefined)
            throw new Error(`Could not find entity with id ${id}`);
        return result;
    }

    // TODO: Rename to getEntitiesByIds
    getEntities(ids: Iterable<EntityId>): Entity[] {
        return Array.from(ids).map((id) => this.getEntity(id));
    }

    getEntitiesContaining(point: Point): Entity[] {
        return Object.values(this.entities).filter((entity) =>
            entity.boundingRect.containsPoint(point),
        );
    }

    getEntitiesIntersecting(rect: Rectangle): Entity[] {
        return Array.from(this.entities.values()).filter((entity) =>
            entity.boundingRect.intersects(rect),
        );
    }

    getMergedBounds(entities: Entity[]): Rectangle {
        return Rectangle.union(entities.map((entity) => entity.boundingRect));
    }

    // --- Socket

    getSocketById(socketId: SocketId): Socket | undefined {
        return this.sockets.get(socketId);
    }

    /**
     * Returns the socket connected with the provided socket id, if any.
     */
    getConnectedSocket(socketId: SocketId): Socket | undefined {
        const connectedSocketId = this.socketConnections.get(socketId);
        if (connectedSocketId === undefined) return undefined;

        return this.getSocketById(connectedSocketId);
    }

    /**
     * Disconnect a socket's connection
     */
    disconnect(socketId: SocketId) {
        const connectedSocket = this.getConnectedSocket(socketId);
        if (connectedSocket === undefined) return;

        this.socketConnections.delete(socketId);
        this.socketConnections.delete(connectedSocket.id);

        // TODO: outputSocket.propagate(undefined, 0);
    }

    // --- De/Serialization

    serialize(entity: Entity): string {
        const obj = JSON.parse(JSON.stringify(entity));

        return JSON.stringify(obj);
    }

    deserialize(str: string): Entity {
        const obj: Entity = JSON.parse(str);

        // position
        obj.position = Object.assign(new Point(0, 0), obj.position);

        // boundingRect
        obj.boundingRect = Object.assign(
            new Rectangle(0, 0, 0, 0),
            obj.boundingRect,
        );

        return obj;
    }
}
