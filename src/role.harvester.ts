import {
    BASE_WORKER_CREEP_BODY,
    HARVESTER_BODY,
    HARVESTERS_COUNT_LIMIT,
    HARVESTERS_EMERGENCY_COUNT_LIMIT
} from "./config";
import CreepTrait from "./creep_traits";
import Economy from "./economy";
import {RESOURCE_ASSIGNMENT} from "./resource_assigner";
import BaseCreepRole from "./role.base_creep";
import StorageLinkKeeperRole from "./role.storage_link_keeper";
import SpawnStrategy from "./spawn_strategy";
import AndChainSpawnStrategy from "./spawn_strategy.and_chain";
import EmergencySpawnStrategy from "./spawn_strategy.emergency";
import LimitedSpawnByRoleCountStrategy from "./spawn_strategy.limited_by_role_count";
import OrChainSpawnStrategy from "./spawn_strategy.or_chain";
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
        if (Economy.isHarvesterEmergency(creep.room, game) && Utils.findCreepsByRole(game, new StorageLinkKeeperRole()).length === 0) {
            return [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER];
        } else if (Economy.isHarvesterEmergency(creep.room, game)) {
            return [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER, STRUCTURE_LINK];
        } else {
            return STORAGE_STRUCTURES;
        }
    }

    public isPrioritySpawn(): boolean {
        return true;
    }

    public run(creep: Creep, game: Game): void {
        const target = Game.getObjectById<Source>(creep.memory[RESOURCE_ASSIGNMENT]);

        if (target.energy > 0 && creep.store.getFreeCapacity() > 0) {
            CreepTrait.harvest(creep, target);
        } else {
            CreepTrait.transferAllEnergy(creep, Utils.getClosestEnergyRecipient(creep, HarvesterRole.getRecipientStructures(creep, game)));
        }
    }

    public getSpawnStrategy(): SpawnStrategy {
        return new OrChainSpawnStrategy([
            new LimitedSpawnByRoleCountStrategy(HARVESTERS_COUNT_LIMIT, this),
            new AndChainSpawnStrategy([
                new EmergencySpawnStrategy((spawn, game) => Economy.isHarvesterEmergency(spawn.room, game)),
                new LimitedSpawnByRoleCountStrategy(HARVESTERS_EMERGENCY_COUNT_LIMIT, this),
            ])
        ]);
    }

    protected getBody(game: Game, spawn: StructureSpawn) {
        const currentCreepCount = Utils.findCreepsByRole(game, this).length;

        if (spawn.room.energyAvailable < HARVESTER_BODY.length * 50 || currentCreepCount < 2) {
            return BASE_WORKER_CREEP_BODY;
        }

        return HARVESTER_BODY;
    }

    protected getRoleName(): string {
        return 'harvester';
    }
}
