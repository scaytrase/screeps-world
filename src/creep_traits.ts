import {SUICIDE_CREEPS} from "./config";

const _ = require('lodash');

export const COLOR_HARVEST_RESOURCE = '#ffdf02';
export const COLOR_TRANSFER_RESOURCE = '#00a4ff';
export const COLOR_BUILD = '#8bff00';
export const COLOR_ATTACK = '#ff0b00';
export const COLOR_SPECIAL_TASKS = '#ff55f4';

export default class CreepTrait {
    public static suicideOldCreep(creep: Creep, ttl: number): void {
        if (!SUICIDE_CREEPS) {
            return;
        }

        if (creep.ticksToLive >= ttl) {
            return;
        }

        if (creep.store.getUsedCapacity() === 0) {
            creep.suicide();
        } else {
            CreepTrait.transferAnyResources(creep);
        }
    }

    public static transferAnyResources(creep: Creep): void {
        const types: StructureConstant[] = [STRUCTURE_STORAGE, STRUCTURE_SPAWN, STRUCTURE_CONTAINER];
        CreepTrait.transferAllResources(creep, creep.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => types.includes(structure.structureType) && structure['store'].getFreeCapacity() > creep.store.getUsedCapacity()
        }).shift());
    }

    public static transferAllEnergy(creep: Creep, target: AnyStructure | null): void {
        if (target) {
            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_TRANSFER_RESOURCE}});
            }
        }
    }

    public static transferAllResources(creep: Creep, target: AnyStructure | null): void {
        if (target) {
            const resourceType = _.findKey(creep.store);
            if (creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {
                    visualizePathStyle: {stroke: COLOR_TRANSFER_RESOURCE},
                    maxRooms: 2
                });
            }
        }
    }

    public static withdrawResource(creep: Creep, target: AnyStructure | Tombstone | Ruin | null, resource: ResourceConstant): void {
        if (target) {
            if (creep.withdraw(target, resource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {
                    visualizePathStyle: {stroke: COLOR_HARVEST_RESOURCE},
                    maxRooms: 2
                });
            }
        }
    }

    public static withdrawAllResources(creep: Creep, target: AnyStructure | Tombstone | Ruin | null): void {
        if (target) {
            if (creep.withdraw(target, _.findKey(target['store'])) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {
                    visualizePathStyle: {stroke: COLOR_HARVEST_RESOURCE},
                    maxRooms: 2
                });
            }
        }
    }

    public static harvest(creep: Creep, source: Source | Mineral | null): void {
        if (source) {
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: COLOR_HARVEST_RESOURCE}});
            }
        }
    }

    public static attack(creep: Creep, target: Creep | null, opts?: MoveToOpts): void {
        if (target) {
            if (creep.body.map(def => def.type).includes(RANGED_ATTACK) && creep.rangedAttack(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_ATTACK}, ...opts});
            } else if (creep.body.map(def => def.type).includes(ATTACK) && creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_ATTACK}, ...opts});
            }
        }
    }

    public static withdrawAllEnergy(creep: Creep, source: Structure | Ruin | Tombstone | null): void {
        if (source) {
            if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: COLOR_HARVEST_RESOURCE}});
            }
        }
    }

    public static build(creep: Creep, target: ConstructionSite | Structure | null): void {
        if (target) {
            if (target instanceof ConstructionSite && creep.build(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_BUILD}});
            } else if (target instanceof Structure && creep.repair(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_BUILD}});
            }
        }
    }

    public static upgradeController(creep: Creep): void {
        if (creep.room.controller) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: COLOR_BUILD}});
            }
        }
    }

    static pickupAllResources(creep: Creep, source: Resource | Tombstone | Ruin | null) {
        if (source) {
            if (source instanceof Tombstone || source instanceof Ruin) {
                CreepTrait.withdrawAllResources(creep, source);
            } else if (source instanceof Resource && creep.pickup(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {
                    visualizePathStyle: {stroke: COLOR_HARVEST_RESOURCE},
                    maxRooms: 2
                });
            }
        }
    }

    private static getClosestSpawn(creep: Creep): StructureSpawn {
        return creep.pos.findClosestByPath(FIND_MY_SPAWNS);
    }

    private static moveToSpawnToRenew(creep: Creep): void {
        const spawn = CreepTrait.getClosestSpawn(creep);
        creep.moveTo(spawn, {visualizePathStyle: {stroke: COLOR_SPECIAL_TASKS}});
        creep.transfer(spawn, RESOURCE_ENERGY);
    }
}
