import Point from "@mapbox/point-geometry";
import { EntityId, SocketId } from "./base.types";
import { PartId } from "../database-types";

export enum SocketIoEnum {
    INPUT = "input",
    OUTPUT = "output",
}

export enum SolidOrFluidEnum {
    FLUID = "fluid",
    SOLID = "solid",
}

export abstract class BaseSocket {
    id: SocketId = "-1.-1";
    /** Polarity of the socket - input or output. */
    abstract type: SocketIoEnum;
    /** Whether the part is solid or a fluid */
    solidOrFluid: SolidOrFluidEnum = SolidOrFluidEnum.SOLID;
    /** ID of the parent entity */
    entityId: EntityId = -1;

    /** Coordinates of the socket relative to the top left of its parent entity */
    position: Point = new Point(0, 0);
    /** Angle of the opening of the socket relative to its East-facing parent entity (in radian). */
    angle: number = 0;

    /** Id of the part flowing through the socket. */
    partId?: PartId;
    // TODO: Use the Fraction class
    flow?: number;

    serialize(): string {
        return JSON.stringify(this);
    }
}

export class SocketInput extends BaseSocket {
    type = SocketIoEnum.INPUT;
}

export class SocketOutput extends BaseSocket {
    type = SocketIoEnum.OUTPUT;
}

export type Socket = SocketInput | SocketOutput;

export function deserializeSocket(str: string): Socket {
    const rawSocket: Socket = JSON.parse(str);

    // Convert position to a Point object
    rawSocket.position = Object.assign(new Point(0, 0), rawSocket.position);

    let socket: Socket;
    if (rawSocket.type === SocketIoEnum.INPUT) {
        socket = Object.assign(new SocketInput(), rawSocket);
    } else {
        socket = Object.assign(new SocketOutput(), rawSocket);
    }

    return socket;
}
