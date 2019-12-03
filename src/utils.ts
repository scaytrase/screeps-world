export enum SORT {
    ASC = "asc",
    DESC = "desc"
}

export default class Utils {
    public static sortByDistance(target: RoomObject, direction: SORT = SORT.ASC): (a: RoomObject, b: RoomObject) => number {
        return (a, b) => (direction === SORT.ASC ? 1 : -1) * Math.sign(a.pos.getRangeTo(target) - b.pos.getRangeTo(target));
    }

    public static sortByHealthPercent(direction: SORT = SORT.ASC): (a: AnyStructure, b: AnyStructure) => number {
        return (a, b) => (direction === SORT.ASC ? 1 : -1) * Math.sign(a.hits / a.hitsMax - b.hits / b.hitsMax);
    }

    public static getFlagByName(name: string, room: Room): Flag | null {
        return room.find(FIND_FLAGS, {filter: {name: name}}).shift();
    }

    public static getClosestEnergySource<T extends Structure = AnyStructure>(
        target: RoomObject,
        allowedTypes: StructureConstant[] = [STRUCTURE_STORAGE, STRUCTURE_LINK, STRUCTURE_CONTAINER],
        lowerStructureLimit: number = 0,
        additionalFilter: (structure: AnyStructure) => boolean = () => true
    ): T | null {
        return target.room
            .find<T>(FIND_STRUCTURES, {
                filter: (structure) => {
                    return allowedTypes.includes(structure.structureType) &&
                        structure['store'].getUsedCapacity(RESOURCE_ENERGY) > lowerStructureLimit &&
                        additionalFilter(structure);
                }
            })
            .sort(this.sortByDistance(target))
            .shift();
    }

    public static getClosestEnergyRecipient(
        target: RoomObject,
        allowedTypes: StructureConstant[] = [STRUCTURE_STORAGE, STRUCTURE_LINK, STRUCTURE_CONTAINER],
        lowerStructureLimit: number = 0,
        additionalFilter: (structure: AnyStructure) => boolean = () => true
    ): AnyStructure | null {
        return target.room
            .find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return allowedTypes.includes(structure.structureType) &&
                        structure['store'].getFreeCapacity(RESOURCE_ENERGY) > lowerStructureLimit &&
                        additionalFilter(structure);
                }
            })
            .sort(this.sortByDistance(target))
            .shift();
    }

    public static isWithinTraversableBorders(object: RoomObject): boolean {
        return object.pos.y > 1
            && object.pos.y < 48
            && object.pos.x > 1
            && object.pos.x < 48;
    }
}
