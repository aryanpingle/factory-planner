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

export interface BaseSocket {
    id?: SocketId;
    /** Polarity of the socket - input or output. */
    type: SocketIoEnum;
    /** Whether the part is solid or a fluid */
    solidOrFluid: SolidOrFluidEnum;
    /** ID of the parent entity */
    entityId: EntityId;

    // --- UI related information ---

    /** Coordinates of the socket relative to the top left of its parent entity */
    position: Point;
    /** Angle of the opening of the socket relative to its East-facing parent entity (in radian). */
    angle: number;

    //
    // Data calculated at runtime (prefixed with an underscore)
    //

    /** Id of the part flowing through the socket. */
    _partId?: PartId;
    // TODO: Use the Fraction class
    _flow?: number;
}

export interface SocketInput extends BaseSocket {
    type: SocketIoEnum.INPUT;
}

export interface SocketOutput extends BaseSocket {
    type: SocketIoEnum.OUTPUT;
}

export type Socket = SocketInput | SocketOutput;
