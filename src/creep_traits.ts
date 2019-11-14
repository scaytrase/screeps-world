import {RENEW_CREEPS, SUICIDE_CREEPS, TTL_UNTIL_RENEW} from "./config";

const _ = require('lodash');

export default class CreepTrait {
    public static renewIfNeeded(creep: Creep): void {
        if (RENEW_CREEPS && creep.ticksToLive < TTL_UNTIL_RENEW) {
            CreepTrait.moveToSpawnToRenew(creep);
        }
    }

    public static suicideOldCreep(creep: Creep, ttl: number): void {
        if (SUICIDE_CREEPS && creep.ticksToLive < ttl) {
            creep.suicide();
        }
    }

    public static transferAllEnergy(creep: Creep, target: AnyStructure | null): void {
        if (target !== null) {
            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#00a4ff'}});
            }
        }
    }

    public static transferAllResources(creep: Creep, target: AnyStructure | null): void {
        if (target !== null) {
            if (creep.transfer(target, _.findKey(target['store'])) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#00a4ff'}});
            }
        }
    }

    public static withdrawAllResources(creep: Creep, target: AnyStructure | Tombstone | null): void {
        if (target !== null) {
            if (creep.withdraw(target, _.findKey(target['store'])) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffdf02'}});
            }
        }
    }

    public static harvest(creep: Creep, source: Source | null): void {
        if (source) {
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffdf02'}});
            }
        }
    }

    public static attack(creep: Creep, target: Creep | null): void {
        if (target) {
            // if (creep.body. && creep.rangedAttack() === ERR_NOT_IN_RANGE) {
            //     creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0b00'}});
            // }
            if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0b00'}});
            }
        }
    }

    public static withdraw(creep: Creep, source: AnyStructure | null): void {
        if (source) {
            if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffdf02'}});
            }
        }
    }

    public static build(creep: Creep, target: ConstructionSite | null): void {
        if (target) {
            if (creep.build(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#8bff00'}});
            }
        }
    }

    public static repair(creep: Creep, target: AnyStructure | null): void {
        if (target) {
            if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#8bff00'}});
            }
        }
    }

    public static upgradeController(creep: Creep): void {
        if (creep.room.controller) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#8bff00'}});
            }
        }
    }

    private static getClosestSpawn(creep: Creep): StructureSpawn {
        return creep.pos.findClosestByPath(FIND_MY_SPAWNS);
    }

    private static moveToSpawnToRenew(creep: Creep): void {
        const spawn = CreepTrait.getClosestSpawn(creep);
        creep.moveTo(spawn, {visualizePathStyle: {stroke: '#ff55f4'}});
        creep.transfer(spawn, RESOURCE_ENERGY);
    }

    static pickup(creep: Creep, source: Resource | Tombstone | null) {
        if (source !== null) {
            if (source instanceof Tombstone) {
                CreepTrait.withdrawAllResources(creep, source);
            } else if (source instanceof Resource && creep.pickup(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffdf02'}});
            }
        }
    }
}
