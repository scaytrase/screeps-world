import {RENEW_CREEPS, TTL_UNTIL_RENEW} from "./config";

export default class CreepTrait {
    private static getClosestSpawn(creep: Creep): StructureSpawn {
        return creep.pos.findClosestByPath(FIND_MY_SPAWNS);
    }

    private static moveToSpawnToRenew(creep: Creep): void {
        const spawn = CreepTrait.getClosestSpawn(creep);
        creep.moveTo(spawn, {visualizePathStyle: {stroke: '#ff55f4'}});
        creep.transfer(spawn, RESOURCE_ENERGY);
    }

    public static renewIfNeeded(creep: Creep): void {
        if (RENEW_CREEPS && creep.ticksToLive < TTL_UNTIL_RENEW) {
            CreepTrait.moveToSpawnToRenew(creep);
        }
    }

    public static transferAllEnergy(creep: Creep, target: AnyStructure | null): void {
        if (target !== null) {
            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#00a4ff'}});
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
}
