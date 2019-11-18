export enum SORT {
    ASC = "asc",
    DESC = "desc"
}

export default class Utils {
    public static sortByDistance(target: RoomObject, direction: SORT = SORT.ASC): (a: RoomObject, b: RoomObject) => number {
        return (a, b) => (direction === SORT.ASC ? 1 : -1) * Math.sign(b.pos.getRangeTo(target) - a.pos.getRangeTo(target));
    }

    public static getFlagByName(name: string, room: Room): Flag | null {
        return room.find(FIND_FLAGS, {filter: {name: name}}).shift();
    }

    public static getClosestEnergySource(
        target: RoomObject,
        allowedTypes: StructureConstant[] = [STRUCTURE_STORAGE, STRUCTURE_LINK, STRUCTURE_CONTAINER],
        lowerStructureLimit: number = 0,
        additionalFilter: (structure: AnyStructure) => boolean = () => true
    ): AnyStructure | null {
        return target.room
            .find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return allowedTypes.includes(structure.structureType) &&
                        structure['store'].getUsedCapacity(RESOURCE_ENERGY) >= lowerStructureLimit &&
                        additionalFilter(structure);
                }
            })
            .sort(this.sortByDistance(target))
            .shift();
    }
}
