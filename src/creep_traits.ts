import {RENEW_CREEPS, SUICIDE_CREEPS, TTL_UNTIL_RENEW} from "./config";

const _ = require('lodash');

const COLOR_HARVEST_RESOURCE = '#ffdf02';
const COLOR_TRANSFER_RESOURCE = '#00a4ff';
const COLOR_BUILD = '#8bff00';
const COLOR_ATTACK = '#ff0b00';
const COLOR_SPECIAL_TASKS = '#ff55f4';

export default class CreepTrait {
    public static renewIfNeeded(creep: Creep): void {
        if (RENEW_CREEPS && creep.ticksToLive < TTL_UNTIL_RENEW) {
            CreepTrait.moveToSpawnToRenew(creep);
        }
    }

    public static suicideOldCreep(creep: Creep, ttl: number): void {
        if (!SUICIDE_CREEPS) {
            return;
        }

        if (creep.ticksToLive >= ttl) {
            return;
        }

        if (creep['store'].getUsedCapacity() === 0) {
            creep.suicide();
        } else {
            const types: StructureConstant[] = [STRUCTURE_STORAGE, STRUCTURE_SPAWN, STRUCTURE_CONTAINER, STRUCTURE_LINK];
            CreepTrait.transferAllResources(creep, creep.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => types.includes(structure.structureType) && structure['store'].getFreeCapacity() > creep['store'].getUsedCapacity()
            }).shift());
        }
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
            const resourceType = _.findKey(creep['store']);
            if (creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {
                    visualizePathStyle: {stroke: COLOR_TRANSFER_RESOURCE},
                    maxRooms: 2
                });
            }
        }
    }

    public static withdrawAllResources(creep: Creep, target: AnyStructure | Tombstone | null): void {
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

    public static attack(creep: Creep, target: Creep | null): void {
        if (target) {
            if (creep.body.map(def => def.type).includes(RANGED_ATTACK) && creep.rangedAttack(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_ATTACK}});
            } else if (creep.body.map(def => def.type).includes(ATTACK) && creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_ATTACK}});
            }
        }
    }

    public static withdrawAllEnergy(creep: Creep, source: AnyStructure | null): void {
        if (source) {
            if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: COLOR_HARVEST_RESOURCE}});
            }
        }
    }

    public static build(creep: Creep, target: ConstructionSite | null): void {
        if (target) {
            if (creep.build(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: COLOR_BUILD}});
            }
        }
    }

    public static repair(creep: Creep, target: AnyStructure | null): void {
        if (target) {
            if (creep.repair(target) == ERR_NOT_IN_RANGE) {
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

    static pickupAllResources(creep: Creep, source: Resource | Tombstone | null) {
        if (source) {
            if (source instanceof Tombstone) {
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
