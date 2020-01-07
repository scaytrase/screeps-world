export declare const ASC: ASC;
export declare const DESC: DESC;

export type DIRECTION = ASC | DESC;
export type ASC = 'ASC';
export type DESC = 'DESC'

export class Sort {
    public static byDistance(target: RoomObject | { pos: RoomPosition }, direction: DIRECTION = ASC): (a: RoomObject | { pos: RoomPosition }, b: RoomObject | { pos: RoomPosition }) => number {
        return (a, b) => (direction === ASC ? 1 : -1) * Math.sign(a.pos.getRangeTo(target) - b.pos.getRangeTo(target));
    }

    public static byHealthPercent(direction: DIRECTION = ASC): (a: AnyStructure, b: AnyStructure) => number {
        return (a, b) => (direction === ASC ? 1 : -1) * Math.sign(a.hits / a.hitsMax - b.hits / b.hitsMax);
    }
}
