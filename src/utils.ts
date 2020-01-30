import GameCache from "./cache";
import {BORDER_WIDTH, GRAVE_KEEPERS_LOOT_BORDERS, WALKABLE_CACHE_TTL} from "./config";
import Role from "./role";
import {Sort} from "./sort_utils";

export default class Utils {
    private static walkable_cache: GameCache<number> = new GameCache<number>();

    public static getClosestEnergyMine(target: RoomObject): Source | undefined {
        return target.room.find(FIND_SOURCES_ACTIVE).sort(Sort.byDistance(target)).shift();
    }

    public static getClosestEnergySource<T extends Structure = AnyStructure>(
        target: RoomObject,
        allowedTypes: StructureConstant[] = [STRUCTURE_STORAGE, STRUCTURE_LINK, STRUCTURE_CONTAINER],
        lowerStructureLimit: number = 0
    ): T | null {
        return target.room
            .find<T>(FIND_STRUCTURES, {
                filter: (structure) => {
                    return allowedTypes.includes(structure.structureType) &&
                        structure['store'].getUsedCapacity(RESOURCE_ENERGY) > lowerStructureLimit;
                }
            })
            .sort(Sort.byDistance(target))
            .shift();
    }

    public static getClosestEnergyRecipient<T extends Structure = AnyStructure>(
        target: RoomObject,
        allowedTypes: StructureConstant[] = [STRUCTURE_STORAGE, STRUCTURE_LINK, STRUCTURE_CONTAINER],
        lowerStructureLimit: number = 0
    ): T | null {
        return target.room
            .find<T>(FIND_STRUCTURES, {
                filter: (structure) => {
                    return allowedTypes.includes(structure.structureType) &&
                        structure['store'].getFreeCapacity() > lowerStructureLimit;
                }
            })
            .sort(Sort.byDistance(target))
            .shift();
    }

    public static getClosestEnergyRecipient2<T extends Structure = AnyStructure>(
        target: RoomObject,
        allowedTypes: StructureConstant[] = [STRUCTURE_STORAGE, STRUCTURE_LINK, STRUCTURE_CONTAINER],
        lowerStructureLimit: number = 0
    ): T | null {
        return target.room
            .find<T>(FIND_STRUCTURES, {
                filter: (structure) => {
                    return allowedTypes.includes(structure.structureType) &&
                        structure['store'].getFreeCapacity(RESOURCE_ENERGY) > lowerStructureLimit;
                }
            })
            .sort(Sort.byDistance(target))
            .shift();
    }


    public static isWithinTraversableBorders(object: RoomObject): boolean {
        return object.pos.y > BORDER_WIDTH
            && object.pos.y < 49 - BORDER_WIDTH
            && object.pos.x > BORDER_WIDTH
            && object.pos.x < 49 - BORDER_WIDTH;
    }

    public static findCreepsByRole(role: Role, room: Room | null): Creep[] {
        return Object
            .values(Game.creeps)
            .filter((creep: Creep) => role.match(creep))
            .filter((creep: Creep) => room === null || creep.room.name === room.name);
    }


    public static getBodyCost(bodyParts: BodyPartConstant[]): number {
        return bodyParts.map(part => BODYPART_COST[part]).reduce((p, v) => p + v, 0);
    }

    public static isCapableToSpawnBodyNow(spawn: StructureSpawn, bodyParts: BodyPartConstant[]): boolean {
        return Game.rooms[spawn.room.name].energyAvailable >= Utils.getBodyCost(bodyParts);
    }

    public static isCapableToSpawnBody(spawn: StructureSpawn, bodyParts: BodyPartConstant[]): boolean {
        return Game.rooms[spawn.room.name].energyCapacityAvailable >= Utils.getBodyCost(bodyParts);
    }

    public static* getFlagsByColors(primary: ColorConstant, secondary?: ColorConstant): Generator<Flag> {
        for (const flag of Object.values(Game.flags)) {
            if (flag.color === primary && (!secondary || flag.secondaryColor === secondary)) {
                yield flag;
            }
        }
    }

    public static getWalkablePositionsAround(target: RoomObject): number {
        return Utils.walkable_cache.getCached(
            target['id'] || `r${target.room.name}x${target.pos.x}y${target.pos.y}`,
            WALKABLE_CACHE_TTL,
            () => {
                let count = 0;

                const resultMatrix = target.room
                    .lookAtArea(target.pos.y - 1, target.pos.x - 1, target.pos.y + 1, target.pos.x + 1, false);

                for (const y in resultMatrix) {
                    for (const x in resultMatrix[y]) {
                        const resultArray = resultMatrix[y][x];
                        const ex = resultArray.filter(
                            result => (result.type === "terrain" && (result.terrain === "plain" || result.terrain === "swamp"))
                                || (result.type === "structure" && (result.structure.structureType === STRUCTURE_ROAD || result.structure.structureType === STRUCTURE_CONTAINER)))
                            .length > 0;
                        if (ex) count++;
                    }
                }

                return count;
            });
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
            if (spawn.spawnCreep(body, 'check', {dryRun: true}) === OK) {
                return body;
            }
        }

        return fallback;
    }

    public static getRoomGraves(room: Room) {
        return [
            ...(room.find(FIND_DROPPED_RESOURCES, {
                filter(resource) {
                    return resource.amount > 0
                        && (GRAVE_KEEPERS_LOOT_BORDERS || Utils.isWithinTraversableBorders(resource));
                }
            })),
            ...(room.find(FIND_TOMBSTONES, {
                filter(tombstone) {
                    return tombstone.store.getUsedCapacity() > 0
                        && (GRAVE_KEEPERS_LOOT_BORDERS || Utils.isWithinTraversableBorders(tombstone));
                }
            })),
            ...(room.find(FIND_RUINS, {
                filter(ruin) {
                    return ruin.store.getUsedCapacity() > 0;
                }
            }))
        ];
    }

    public static countCreepBodyParts(creep: Creep, type: BodyPartConstant): number {
        return creep.body.filter(part => part.type === type).length;
    }

    public static getCreepRenewTtl(creep: Creep): number {
        return creep.body.map(part => 3).reduce((p, v) => p + v, 0);
    }

    public static filterDeadCreeps(creep: Creep): boolean {
        return creep.ticksToLive >= Utils.getCreepRenewTtl(creep);
    }
}
