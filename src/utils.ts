import Role from "./role";

export enum SORT {
    ASC = "asc",
    DESC = "desc"
}

const _ = require('lodash');

export default class Utils {
    public static sortByDistance(target: RoomObject | { pos: RoomPosition }, direction: SORT = SORT.ASC): (a: RoomObject | { pos: RoomPosition }, b: RoomObject | { pos: RoomPosition }) => number {
        return (a, b) => (direction === SORT.ASC ? 1 : -1) * Math.sign(a.pos.getRangeTo(target) - b.pos.getRangeTo(target));
    }

    public static sortByHealthPercent(direction: SORT = SORT.ASC): (a: AnyStructure, b: AnyStructure) => number {
        return (a, b) => (direction === SORT.ASC ? 1 : -1) * Math.sign(a.hits / a.hitsMax - b.hits / b.hitsMax);
    }

    public static getFlagByName(name: string, room: Room): Flag | null {
        return room.find(FIND_FLAGS, {filter: {name: name}}).shift();
    }

    public static getClosestEnergyMine(target: RoomObject): Source {
        return target.room.find(FIND_SOURCES_ACTIVE).sort(Utils.sortByDistance(target)).shift();
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

    public static getClosestEnergyRecipient<T extends Structure = AnyStructure>(
        target: RoomObject,
        allowedTypes: StructureConstant[] = [STRUCTURE_STORAGE, STRUCTURE_LINK, STRUCTURE_CONTAINER],
        lowerStructureLimit: number = 0,
        additionalFilter: (structure: AnyStructure) => boolean = () => true
    ): T | null {
        return target.room
            .find<T>(FIND_STRUCTURES, {
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

    public static findCreepsByRole(game: Game, role: Role, room: Room): Creep[] {
        return _.filter(
            game.creeps,
            (creep: Creep) => (role.match(creep) && (creep.room.name === room.name))
        );
    }

    public static getBodyCost(bodyParts: BodyPartConstant[]): number {
        return bodyParts.map(part => BODYPART_COST[part]).reduce((p, v) => p + v, 0);
    }

    public static isCapableToSpawnBodyNow(spawn: StructureSpawn, bodyParts: BodyPartConstant[]): boolean {
        return spawn.room.energyAvailable >= Utils.getBodyCost(bodyParts);
    }

    public static isCapableToSpawnBody(spawn: StructureSpawn, bodyParts: BodyPartConstant[]): boolean {
        return spawn.room.energyCapacityAvailable >= Utils.getBodyCost(bodyParts);
    }

    public static* getFlagsByColors(game: Game, primary: ColorConstant, secondary?: ColorConstant): Generator<Flag> {
        for (let flagName in Game.flags) {
            const flag = Game.flags[flagName];
            if (flag.color === primary && (!secondary || flag.secondaryColor === secondary)) {
                yield flag;
            }
        }
    }

    public static getWalkablePositionsAround(target: RoomObject): number {
        return target.room.lookAtArea(target.pos.y - 1, target.pos.x - 1, target.pos.y + 1, target.pos.x + 1, true).filter(
            result => result.terrain === "plain"
        ).length;
    }

    public static getBiggerPossibleBody(bodies: BodyPartConstant[][], fallback: BodyPartConstant[], spawn: StructureSpawn): BodyPartConstant[] {
        for (const body of bodies) {
            if (Utils.isCapableToSpawnBody(spawn, body)) {
                return body;
            }
        }

        return fallback;
    }

    public static getBiggerPossibleBodyNow(bodies: BodyPartConstant[][], fallback: BodyPartConstant[], spawn: StructureSpawn): BodyPartConstant[] {
        for (const body of bodies) {
            if (Utils.isCapableToSpawnBodyNow(spawn, body)) {
                return body;
            }
        }

        return fallback;
    }
}
