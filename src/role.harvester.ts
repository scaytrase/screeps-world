import {BASE_WORKER_CREEP_BODY, HARVESTERS_COUNT_LIMIT, WORKER_BODIES} from "./config";
import CreepTrait from "./creep_traits";
import Economy from "./economy";
import {RESOURCE_ASSIGNMENT} from "./resource_assigner";
import BaseCreepRole from "./role.base_creep";
import StorageLinkKeeperRole from "./role.storage_link_keeper";
import SpawnStrategy from "./spawn_strategy";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import Utils from "./utils";

const _ = require('lodash');

const STORAGE_STRUCTURES: StructureConstant[] = [
    STRUCTURE_LINK,
    STRUCTURE_SPAWN,
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_EXTENSION,
];

export default class HarvesterRole extends BaseCreepRole {
    private static getRecipientStructures(creep: Creep, game: Game): StructureConstant[] {
        if (Economy.isHarvesterEmergency(creep.room, game) && Utils.findCreepsByRole(game, new StorageLinkKeeperRole(), creep.room).length === 0) {
            return [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER];
        } else if (Economy.isHarvesterEmergency(creep.room, game)) {
            return [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER, STRUCTURE_LINK];
        } else {
            return STORAGE_STRUCTURES;
        }
    }

    public isPrioritySpawn(spawn: StructureSpawn, game: Game): boolean {
        return Utils.findCreepsByRole(game, this, spawn.room).length < spawn.room.find(FIND_SOURCES).length;
    }

    public run(creep: Creep, game: Game): void {
        const target = Game.getObjectById<Source>(creep.memory[RESOURCE_ASSIGNMENT]);

        if (target && target.energy > 0 && creep.store.getFreeCapacity() > 0) {
            CreepTrait.harvest(creep, target);
        } else {
            CreepTrait.transferAllEnergy(creep, Utils.getClosestEnergyRecipient(creep, HarvesterRole.getRecipientStructures(creep, game)));
        }
    }

    public getSpawnStrategy(): SpawnStrategy {
        return new LimitedSpawnByRoleCountStrategy(
            1,
            this,
            (spawn) => spawn.room
                .find(FIND_SOURCES)
                .map(source => Utils.getWalkablePositionsAround(source))
                .map(v => Math.min(HARVESTERS_COUNT_LIMIT, v))
                .reduce((p, v) => p + v, 0)
        );
    }

    protected getBody(game: Game, spawn: StructureSpawn) {
        if (Utils.findCreepsByRole(game, this, spawn.room).length === 0) {
            return Utils.getBiggerPossibleBodyNow(WORKER_BODIES, BASE_WORKER_CREEP_BODY, spawn);
        }

        return Utils.getBiggerPossibleBody(WORKER_BODIES, BASE_WORKER_CREEP_BODY, spawn);
    }

    protected getRoleName(): string {
        return 'harvester';
    }
}
